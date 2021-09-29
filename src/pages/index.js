import * as React from "react";
import styled from "styled-components";
import { graphql, useStaticQuery } from "gatsby";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Box = styled.div`
  border: 2px solid black;
`;

const Item = (node) => {
  console.log(node);
  return (<Box><p>{node.node.id}</p><a href={node.node.url}>{node.node.title}</a></Box>)
}

const IndexPage = () => {
  const data = useStaticQuery(graphql`
  query HeaderQuery {
    allStory {
      edges {
        node {
          id
          url
          title
        }
      }
    }
  }
`)
console.log("dataaa", data);

  return <Container>{data.allStory.edges.map((story) => (<Item key={story.node.id} node={story.node}></Item>))}</Container>;
};

export default IndexPage;

/* export const query = graphql`
  query {
    example {
      url
      title
    }
  }
`; */
