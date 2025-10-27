export interface User {
  id: string;
  email: string;
  username: string;
  __typename: string;
}

export interface JobDescription {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSection {
  id: string;
  sectionName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  title: string;
  latexCode?: string;
  fileUrl?: string;
  fileType?: string;
  sections?: ResumeSection[];
  createdAt: string;
  updatedAt: string;
}

export interface GetUserJobDescriptionsResponse {
  getUserJobDescriptions: JobDescription[];
}

export interface GetUserResumesResponse {
  getUserResumes: Resume[];
}

export interface CreateJobDescriptionResponse {
  createJobDescription: JobDescription;
}

export interface UploadResumeResponse {
  uploadResume: Resume;
}
