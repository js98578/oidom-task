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
        contextFields: [],
        fragment: true,
        space: `html`,
        emitParseErrors: false,
        verbose: false,
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
