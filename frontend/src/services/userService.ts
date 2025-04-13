import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
}

export const userService = {
  getUser: async (id: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            username
            email
            role
            createdAt
          }
        }
      `,
      variables: { id },
    });
    return data.user;
  },

  getUsers: async () => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetUsers {
          users {
            id
            username
            email
            role
            createdAt
          }
        }
      `,
    });
    return data.users;
  },

  login: async (email: string, password: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
            username
            email
            role
          }
        }
      `,
      variables: { email, password },
    });
    return data.login;
  },

  logout: async () => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation Logout {
          logout
        }
      `,
    });
    return data.logout;
  },

  createUser: async (
    username: string,
    email: string,
    password: string,
    role: "ADMIN" | "USER"
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation CreateUser(
          $username: String!
          $email: String!
          $password: String!
          $role: Role
        ) {
          createUser(
            username: $username
            email: $email
            password: $password
            role: $role
          ) {
            id
            username
            email
            role
            createdAt
          }
        }
      `,
      variables: { username, email, password, role },
    });
    return data.createUser;
  },
};
