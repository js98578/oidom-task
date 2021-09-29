const axios = require("axios");
const HTMLParser = require("node-html-parser");
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

exports.onCreateNode = async ({
  node,
  actions,
  createContentDigest,
  getCache,
  store,
}) => {
  const { createNode, createNodeField } = actions;
  if (node.internal.type === "File" && node.ext === ".html") {
    const parsedHTML = HTMLParser.parse(node.internal.content);
    const ogUrl = parsedHTML.querySelector("meta[property='og:url']");
    const ogTitle = parsedHTML.querySelector("meta[property='og:title']");
    const ogDescription = parsedHTML.querySelector(
      "meta[property='og:description']"
    );

    const ogImage = parsedHTML.querySelector("meta[property='og:image']");
    let isImage = false;
    if (
      ogImage !== null &&
      ogImage.attributes !== null &&
      ogImage.attributes.content !== null
    ) {
      isImage = true;
      try {
        const imageNode = await createRemoteFileNode({
          url: ogImage.attributes.content,
          parentNodeId: `story-og-${node.id.toString()}`,
          getCache,
          createNode,
          createNodeId: () => `story-og-img-${node.id.toString()}`,
          store,
        });
      } catch (err) {
        console.log("error on creating image node", err);
      }
    }
    if (ogUrl && ogTitle && ogDescription) {
      const storyOgNode = {
        id: `story-og-${node.id.toString()}`,
        parent: node.id.toString(),
        internal: {
          type: `OgStory`,
          contentDigest: createContentDigest(`story-og-${node.id.toString()}`),
        },
        children: [],
        ogDescription: ogDescription.attributes.content,
        ogUrl: ogUrl.attributes.content,
        ogTitle: ogTitle.attributes.content,
      };
      if (isImage) {
        storyOgNode.children.push(`story-og-img-${node.id.toString()}`);
      }
      createNode(storyOgNode);
    }
  }
};

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  getCache,
  store,
}) => {
  const { createNode, createTypes, deleteNode } = actions;
  const dummyStoryOgNode = {
    id: "dummy",
    parent: null,
    internal: {
      type: `OgStory`,
      contentDigest: createContentDigest("dummy"),
    },
    children: ["dummy1"],
    ogDescription: "dummy",
    ogUrl: "dummy",
    ogTitle: "dummy",
  };
  createNode(dummyStoryOgNode);

  const fetchStories = () =>
    axios.get(`https://hacker-news.firebaseio.com/v0/topstories.json`);
  const storiesIds = await fetchStories();
  const data = await Promise.all(
    storiesIds.data
      .slice(0, 20)
      .map((id) =>
        axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
        )
      )
  );
  const allStories = data.map((dataItem) => dataItem.data);

  // filter by date to show only articles 4 hours old
  const dt = new Date();
  dt.setHours(dt.getHours() + 4);
  const secondsSinceEpoch = Math.floor(dt / 1000);
  const timeFilteredStories = allStories.filter(
    (story) => story.time < secondsSinceEpoch
  );

  // filter based on score
  const scoreFilteredStories = timeFilteredStories.filter(
    (story) => story.score >= 70
  );

  // sort by creation date/time
  scoreFilteredStories.sort(function (a, b) {
    return b.time - a.time;
  });

  scoreFilteredStories.map(async (story, i) => {
    try {
      fileNode = await createRemoteFileNode({
        url: story.url,
        parentNodeId: `story-og-${story.id.toString()}`,
        getCache,
        createNode,
        createNodeId: () => `${story.id}`,
        store,
        ext: ".html",
      });
    } catch (e) {
      // Ignore
    }
  });
  deleteNode(dummyStoryOgNode);
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
      type OgStory implements Node {
        ogUrl: String
        ogTitle: String
        ogDescription: String
        childFile: File
      }
    `;
  createTypes(typeDefs);
};
