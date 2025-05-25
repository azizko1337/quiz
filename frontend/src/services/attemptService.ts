import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client.ts";

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score?: number;
  createdAt: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  quizAttemptId: string;
  answerId?: string;
  answerBody?: boolean;
  createdAt: string;
}

export const attemptService = {
  getQuizAttempt: async (id: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuizAttempt($id: ID!) {
          quizAttempt(id: $id) {
            id
            quizId
            userId
            score
            createdAt
          }
        }
      `,
      variables: { id },
    });
    return data.quizAttempt;
  },

  getQuizAttempts: async (userId: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuizAttempts($userId: ID!) {
          quizAttempts(userId: $userId) {
            id
            quizId
            userId
            score
            createdAt
          }
        }
      `,
      variables: { userId },
    });
    return data.quizAttempts;
  },

  createQuizAttempt: async (quizId: string, userId: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation CreateQuizAttempt($quizId: ID!, $userId: ID!) {
          createQuizAttempt(quizId: $quizId, userId: $userId) {
            id
            quizId
            userId
            score
            createdAt
          }
        }
      `,
      variables: { quizId, userId },
    });
    return data.createQuizAttempt;
  },

  persistQuizAttempt: async (
    quizId: string,
    userId: string,
    score?: number
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation PersistQuizAttempt($quizId: ID!, $userId: ID!, $score: Int) {
          persistQuizAttempt(quizId: $quizId, userId: $userId, score: $score) {
            id
            quizId
            userId
            score
            createdAt
          }
        }
      `,
      variables: { quizId, userId, score },
    });
    return data.persistQuizAttempt;
  },

  deleteQuizAttempt: async (id: string) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation DeleteQuizAttempt($id: ID!) {
          deleteQuizAttempt(id: $id)
        }
      `,
      variables: { id },
    });
    return data.deleteQuizAttempt;
  },

  persistQuestionAttempt: async (
    questionId: string,
    quizAttemptId: string,
    answerId?: string,
    answerBody?: boolean
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation PersistQuestionAttempt(
          $questionId: ID!
          $quizAttemptId: ID!
          $answerId: ID
          $answerBody: Boolean
        ) {
          persistQuestionAttempt(
            questionId: $questionId
            quizAttemptId: $quizAttemptId
            answerId: $answerId
            answerBody: $answerBody
          ) {
            id
            questionId
            quizAttemptId
            answerId
            answerBody
            createdAt
          }
        }
      `,
      variables: { questionId, quizAttemptId, answerId, answerBody },
    });
    return data.persistQuestionAttempt;
  },

  getQuestionAttempts: async (quizAttemptId: string) => {
    const { data } = await apolloClient.query({
      query: gql`
        query GetQuestionAttempts($quizAttemptId: ID!) {
          questionAttempts(quizAttemptId: $quizAttemptId) {
            id
            questionId
            quizAttemptId
            answerId
            answerBody
            createdAt
          }
        }
      `,
      variables: { quizAttemptId },
    });
    return data.questionAttempts;
  },
};
