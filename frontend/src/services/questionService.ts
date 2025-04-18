import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client.ts";

export interface Question {
  id: string;
  quizId: string;
  question: string;
  image?: string;
  createdAt: string;
}

export const questionService = {
  getQuestion: async (id: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuestion($id: ID!) {
          question(id: $id) {
            id
            quizId
            question
            image
            createdAt
          }
        }
      `,
      variables: { id },
    });
    return data.question;
  },

  getQuestions: async (quizId: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuestions($quizId: ID!) {
          questions(quizId: $quizId) {
            id
            quizId
            question
            image
            createdAt
          }
        }
      `,
      variables: { quizId },
    });
    return data.questions;
  },

  createQuestion: async (quizId: string, question: string, image?: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation CreateQuestion(
          $quizId: ID!
          $question: String!
          $image: String
        ) {
          createQuestion(quizId: $quizId, question: $question, image: $image) {
            id
            quizId
            question
            image
            createdAt
          }
        }
      `,
      variables: { quizId, question, image },
    });
    return data.createQuestion;
  },

  updateQuestion: async (id: string, question?: string, image?: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation UpdateQuestion($id: ID!, $question: String, $image: String) {
          updateQuestion(id: $id, question: $question, image: $image) {
            id
            quizId
            question
            image
            createdAt
          }
        }
      `,
      variables: { id, question, image },
    });
    return data.updateQuestion;
  },

  deleteQuestion: async (id: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation DeleteQuestion($id: ID!) {
          deleteQuestion(id: $id)
        }
      `,
      variables: { id },
    });
    return data.deleteQuestion;
  },
};
