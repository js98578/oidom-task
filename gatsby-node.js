const axios = require("axios");
const crypto = require("crypto");
const { createFilePath } = require(`gatsby-source-filesystem`);
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  // Ensures we are processing only markdown files
  if (node.internal.type === "HtmlRehype") {
    console.log(node.internal.type, node);
    // Use `createFilePath` to turn markdown files in our `data/faqs` directory into `/faqs/slug`
    const relativeFilePath = createFilePath({
      node,
      getNode,
      basePath: "data/faqs/",
    });

    // Creates new query'able field with name of 'slug'
    createNodeField({
      node,
      name: "slug",
      value: `/faqs${relativeFilePath}`,
    });

/*     createRemoteFileNode({
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
      ext: ".html",
    }); */
  }
};

exports.sourceNodes = async ({ actions, createContentDigest, getCache }) => {
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

  scoreFilteredStories.map((story, i) => {
    // Create your node object
    const storyNode = {
      // Required fields
      id: story.id.toString(),
      parent: null,
      internal: {
        type: `Story`,
        contentDigest: createContentDigest(story),
      },
      children: [],

      // Other fields that you want to query with graphQl
      title: story.title,
      url: story.url,
    };

    // Create node with the gatsby createNode() API
    createNode(storyNode);
    createRemoteFileNode({
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
      ext: ".html",
    });
  });
};
