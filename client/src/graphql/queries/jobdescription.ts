import { gql } from "@apollo/client";

export const GET_JOB_DESCRIPTIONS = gql`
  query GetUserJobDescriptions($userId: ID!) {
    getUserJobDescriptions(userId: $userId) {
      id
      title
      content
      createdAt
      updatedAt
    }
  }
`;
