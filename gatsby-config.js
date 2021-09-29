module.exports = {
  siteMetadata: {
    siteUrl: "https://www.yourdomain.tld",
    title: "oidom-task",
  },
  plugins: [
    "gatsby-plugin-styled-components",
    {
      resolve: `gatsby-transformer-rehype`,
      options: {
        // Condition for selecting an existing GrapghQL node (optional)
        // If not set, the transformer operates on file nodes.
        // filter: (node) => node.internal.type === `GhostPost`,
        // Only needed when using filter (optional, default: node.html)
        // Source location of the html to be transformed
        // source: (node) => node.html,
        // Additional fields of the sourced node can be added here (optional)
        // These fields are then available on the htmlNode on `htmlNode.context`
        contextFields: [],
        // Fragment mode (optional, default: true)
        fragment: true,
        // Space mode (optional, default: `html`)
        space: `html`,
        // EmitParseErrors mode (optional, default: false)
        emitParseErrors: false,
        // Verbose mode (optional, default: false)
        verbose: false,
        // Plugins configs (optional but most likely you need one)
        plugins: [],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `stories`,
        path: `${__dirname}/src/stories/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `og-images`,
        path: `${__dirname}/src/images/`,
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
};
