import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { setContext } from '@apollo/client/link/context';

const uploadLink = new UploadHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  credentials: 'include',
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: from([authLink, uploadLink]),
  cache: new InMemoryCache(),
});

export default client;