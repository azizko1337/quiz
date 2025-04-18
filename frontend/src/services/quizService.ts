import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client.ts";
import type { User } from "./userService.ts";

export interface Quiz {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  createdAt: string;
  author: User;
  public: boolean;
}

export const quizService = {
  getQuiz: async (id: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuiz($id: ID!) {
          quiz(id: $id) {
            id
            authorId
            title
            description
            createdAt
            public
          }
        }
      `,
      variables: { id },
    });
    return data.quiz;
  },

  getQuizzes: async (authorId?: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuizzes($authorId: ID) {
          quizzes(authorId: $authorId) {
            id
            authorId
            title
            description
            createdAt
            public
          }
        }
      `,
      variables: { authorId },
    });
    return data.quizzes;
  },

  createQuiz: async (authorId: string, title: string, description?: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation CreateQuiz(
          $authorId: ID!
          $title: String!
          $description: String
        ) {
          createQuiz(
            authorId: $authorId
            title: $title
            description: $description
          ) {
            id
            authorId
            title
            description
            createdAt
            public
          }
        }
      `,
      variables: { authorId, title, description },
    });
    return data.createQuiz;
  },

  updateQuiz: async (id: string, title?: string, description?: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation UpdateQuiz($id: ID!, $title: String, $description: String) {
          updateQuiz(id: $id, title: $title, description: $description) {
            id
            authorId
            title
            description
            createdAt
            public
          }
        }
      `,
      variables: { id, title, description },
    });
    return data.updateQuiz;
  },

  deleteQuiz: async (id: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation DeleteQuiz($id: ID!) {
          deleteQuiz(id: $id)
        }
      `,
      variables: { id },
    });
    return data.deleteQuiz;
  },
};
