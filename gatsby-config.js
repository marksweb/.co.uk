const urljoin = require('url-join');
const { makePostUrl } = require('./src/utils/routes');
const config = require('./src/data/SiteConfig');

module.exports = {
  pathPrefix: config.pathPrefix === '' ? '/' : config.pathPrefix,
  siteMetadata: {
    title: config.siteTitle,
    description: config.description,
    author: config.author,
    siteUrl: urljoin(config.siteUrl, config.pathPrefix),
    social: {
      github: `marksweb`,
      stackoverflow: `1199464`,
      twitter: `markwalker_`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/posts`,
        name: `posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/static`,
        name: `static`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 700,
            },
          },
          {
            resolve: `gatsby-remark-vscode`,
            options: {
              theme: 'Abyss',
              extensions: ['toml'],
            },
          },
          `gatsby-remark-smartypants`,
          `gatsby-remark-external-links`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: config.googleAnalyticsID,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                const postPath = makePostUrl(edge.node.fields.slug);
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: `${site.siteMetadata.siteUrl}${postPath}`,
                  guid: `${site.siteMetadata.siteUrl}${postPath}`,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { fields: [frontmatter___date], order: DESC },
                ) {
                  edges {
                    node {
                      fields { 
                        slug 
                      }
                      excerpt
                      html
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: 'RSS feed',
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Mark Walker`,
        short_name: `mark-walker`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#666666`,
        display: `minimal-ui`,
        icon: `src/static/avatar.jpg`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-plugin-csp`,
      options: {
        mergeScriptHashes: false,
        mergeStyleHashes: false,
        directives: {
          'script-src': "'self' 'unsafe-inline' data: www.google-analytics.com",
          'style-src': `'self' 'unsafe-inline'`,
          'img-src': `'self' data: www.google-analytics.com`,
          'default-src': `'self'`,
          'connect-src': `'self' data: www.google-analytics.com`,
        },
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-robots-txt`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
        omitGoogleFont: true,
      },
    },
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          '/*': [
            // The CSP is generated by gatsby-plugin-csp and added to the _headers file in public/ before publish.
            // That is handled by the build script which executes csp-util.js, which looks for the token below.
            'Content-Security-Policy: __REPLACE_ME__',
            'Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
          ],
        },
        mergeSecurityHeaders: true, // boolean to turn off the default security headers
      },
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://www.markw.co.uk`,
      },
    },
    {
      resolve: "@sentry/gatsby",
      options: {
        dsn: "https://79a44fccebae470f8c022a0a6575562b@o961321.ingest.sentry.io/5909725",
        sampleRate: 0.7,
      },
    },
  ],
};
