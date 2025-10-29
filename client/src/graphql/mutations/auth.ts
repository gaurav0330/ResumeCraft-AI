import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        email
        username
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $username: String!) {
    register(email: $email, password: $password, username: $username) {
      id
      email
      username
    }
  }
`;

export const NEON_LOGIN_MUTATION = gql`
  mutation NeonLogin($email: String!, $name: String, $stackToken: String) {
    neonLogin(email: $email, name: $name, stackToken: $stackToken) {
      accessToken
      user {
        id
        email
        username
      }
    }
  }
`;