import { gql } from "@apollo/client";

// Query to get all resumes for a given user
export const GET_USER_RESUMES_QUERY = gql`
  query GetUserResumes($userId: ID!) {
    getUserResumes(userId: $userId) {
      id
      title
      latexCode
      fileUrl
      fileType
      createdAt
      updatedAt
    }
  }
`;
