import { gql } from "@apollo/client";

// Mutation for uploading a resume (either LaTeX code or file)
export const UPLOAD_RESUME_MUTATION = gql`
  mutation UploadResume(
    $title: String!
    $latexCode: String
    $file: Upload
    $fileType: String
  ) {
    uploadResume(
      title: $title
      latexCode: $latexCode
      file: $file
      fileType: $fileType
    ) {
      id
      title
      latexCode
      fileUrl
      fileType
      sections {
        id
        sectionName
        content
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
