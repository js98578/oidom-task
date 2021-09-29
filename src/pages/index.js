import * as React from "react";
import styled from "styled-components";
import { graphql, useStaticQuery } from "gatsby";
import Img from "gatsby-image"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Box = styled.div`
  border: 2px solid black;
`;

const Item = ({ node }) => {
  return (
    <Box>
      <a href={node.ogUrl}>{node.ogTitle}</a>
      {node.childrenFile[0] && <Img fixed={node.childrenFile[0].childImageSharp.fixed} />}
      <p>{node.ogDescription}</p>
    </Box>
  );
};

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      allOgStory {
        nodes {
          ogDescription
          ogTitle
          ogUrl
          childrenFile {
            id
            childImageSharp {
              fixed(width: 160, height: 160) {
                ...GatsbyImageSharpFixed
              }
            }
          }
          id
        }
      }
    }
  `);

  return (
    <Container>
      {data.allOgStory.nodes.map((node) => (
        <Item key={node.id} node={node}></Item>
      ))}
    </Container>
  );
};

export default IndexPage;