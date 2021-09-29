const axios = require("axios");
const HTMLParser = require("node-html-parser");
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  getCache,
  store,
}) => {
  const { createNode } = actions;
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
    const storyNode = {
      // Required fields
      id: story.id.toString(),
      parent: null,
      internal: {
        type: `Story`,
        contentDigest: createContentDigest(story),
      },
      children: [
        `story-html-${story.id.toString()}`,
        `story-og-img-${story.id.toString()}`,
      ],

      // Other fields that you want to query with graphQl
      title: story.title,
      url: story.url,
    };

    // Create node with the gatsby createNode() API
    createNode(storyNode);
    try {
      fileNode = await createRemoteFileNode({
        // The source url of the remote file
        url: story.url,
        // The id of the parent node (i.e. the node to which the new remote File node will be linked to.
        parentNodeId: story.id.toString(),
        // Gatsby's cache which the helper uses to check if the file has been downloaded already. It's passed to all Node APIs.
        getCache,
        // The action used to create nodes
        createNode,
        // A helper function for creating node Ids
        createNodeId: () => `story-html-${story.id}`,
        store,
        ext: ".html",
      });
      const parsedHTML = HTMLParser.parse(fileNode.internal.content);
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
            // The source url of the remote file
            url: ogImage.attributes.content,
            parentNodeId: storyNode.id,
            // Gatsby's cache which the helper uses to check if the file has been downloaded already. It's passed to all Node APIs.
            getCache,
            // The action used to create nodes
            createNode,
            // A helper function for creating node Ids
            createNodeId: () => `story-og-img-${storyNode.id}`,
            store,
          });
        } catch (err) {
          console.log("error on creating image node", err);
        }
      }
      const storyOgNode = {
        // Required fields
        id: `story-og-${story.id.toString()}`,
        parent: story.id.toString(),
        internal: {
          type: `OgStory`,
          contentDigest: createContentDigest(story),
        },
        children: [],

        // Other fields that you want to query with graphQl
        ogDescription: ogDescription.attributes.content,
        ogUrl: ogUrl.attributes.content,
        ogTitle: ogTitle.attributes.content,
      };
      if (isImage) {
        storyOgNode.children.push(`story-og-img-${story.id.toString()}`);
      }
      // Create node with the gatsby createNode() API
      createNode(storyOgNode);
    } catch (e) {
      // Ignore
    }
  });
};

