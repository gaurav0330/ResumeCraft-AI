import { gql } from "@apollo/client";

export const CREATE_JOB_DESCRIPTION_MUTATION = gql`
  mutation CreateJobDescription($title: String!, $content: String!) {
    createJobDescription(title: $title, content: $content) {
      id
      title
      content
      createdAt
      updatedAt
    }
  }
`;
