import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client.ts";
import { userService, type User } from "./userService.ts";

export interface Quiz {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  createdAt: string;
  author: User;
  isPublic: boolean;
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
            isPublic
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
            isPublic
          }
        }
      `,
      variables: { authorId },
    });
    const quizzesWithAuthors = await Promise.all(
      data.quizzes.map(async (quiz: Quiz) => {
        return {
          ...quiz,
          author: await userService.getUser(quiz.authorId),
        };
      })
    );

    return quizzesWithAuthors;
  },

  createQuiz: async (
    authorId: string,
    title: string,
    isPublic: boolean,
    description?: string
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation CreateQuiz(
          $authorId: ID!
          $title: String!
          $description: String
          $isPublic: Boolean
        ) {
          createQuiz(
            authorId: $authorId
            title: $title
            description: $description
            isPublic: $isPublic
          ) {
            id
            authorId
            title
            description
            createdAt
            isPublic
          }
        }
      `,
      variables: { authorId, title, description, isPublic },
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
            isPublic
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
