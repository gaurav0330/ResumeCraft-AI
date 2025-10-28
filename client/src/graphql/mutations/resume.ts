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
      optimizedLatex
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

export const OPTIMIZE_RESUME_PREVIEW = gql`
  mutation OptimizeResumePreview($resumeId: ID!, $jobDescriptionId: ID!) {
    optimizeResumePreview(resumeId: $resumeId, jobDescriptionId: $jobDescriptionId) {
      optimizedLatex
      optimizedSections { sectionName content }
      changes { sectionName changeType originalContent newContent explanation }
    }
  }
`;

export const ACCEPT_OPTIMIZED_RESUME = gql`
  mutation AcceptOptimizedResume($resumeId: ID!, $optimizedLatex: String!) {
    acceptOptimizedResume(resumeId: $resumeId, optimizedLatex: $optimizedLatex) {
      id
      title
      latexCode
      optimizedLatex
      updatedAt
    }
  }
`;
