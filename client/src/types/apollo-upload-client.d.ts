declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client';
  export interface CreateUploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: Record<string, string>;
    // allow other fields too
    [k: string]: any;
  }
  export function createUploadLink(options?: CreateUploadLinkOptions): ApolloLink;
  export default createUploadLink;
}