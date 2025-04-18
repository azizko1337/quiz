import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client.ts";

export interface Answer {
  id: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  image?: string;
  createdAt: string;
}

export const answerService = {
  getAnswer: async (id: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetAnswer($id: ID!) {
          answer(id: $id) {
            id
            questionId
            answer
            isCorrect
            image
            createdAt
          }
        }
      `,
      variables: { id },
    });
    return data.answer;
  },

  getAnswers: async (questionId: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetAnswers($questionId: ID!) {
          answers(questionId: $questionId) {
            id
            questionId
            answer
            isCorrect
            image
            createdAt
          }
        }
      `,
      variables: { questionId },
    });
    return data.answers;
  },

  createAnswer: async (
    questionId: string,
    answer: string,
    isCorrect: boolean,
    image?: string
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation CreateAnswer(
          $questionId: ID!
          $answer: String!
          $isCorrect: Boolean!
          $image: String
        ) {
          createAnswer(
            questionId: $questionId
            answer: $answer
            isCorrect: $isCorrect
            image: $image
          ) {
            id
            questionId
            answer
            isCorrect
            image
            createdAt
          }
        }
      `,
      variables: { questionId, answer, isCorrect, image },
    });
    return data.createAnswer;
  },

  updateAnswer: async (
    id: string,
    answer?: string,
    isCorrect?: boolean,
    image?: string
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation UpdateAnswer(
          $id: ID!
          $answer: String
          $isCorrect: Boolean
          $image: String
        ) {
          updateAnswer(
            id: $id
            answer: $answer
            isCorrect: $isCorrect
            image: $image
          ) {
            id
            questionId
            answer
            isCorrect
            image
            createdAt
          }
        }
      `,
      variables: { id, answer, isCorrect, image },
    });
    return data.updateAnswer;
  },

  deleteAnswer: async (id: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation DeleteAnswer($id: ID!) {
          deleteAnswer(id: $id)
        }
      `,
      variables: { id },
    });
    return data.deleteAnswer;
  },
};
