import { gql } from "@apollo/client/core";
import { apolloClient } from "../apollo-client.ts";
import type { Quiz } from "./quizService.ts";

export const aiService = {
  generateQuiz: async (
    title: String,
    description: String,
    isPublic: boolean,
    numberOfQuestions: number,
    additionalInfo: String | null
  ): Promise<Quiz | null> => {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation GenerateQuiz(
          $title: String!
          $description: String!
          $isPublic: Boolean!
          $numberOfQuestions: Int!
          $additionalInfo: String
        ) {
          generateQuiz(
            title: $title
            description: $description
            isPublic: $isPublic
            numberOfQuestions: $numberOfQuestions
            additionalInfo: $additionalInfo
          ) {
            id
            title
            description
            isPublic
            createdAt
            authorId
          }
        }
      `,
      variables: {
        title,
        description,
        isPublic,
        numberOfQuestions,
        additionalInfo,
      },
    });
    return data.generateQuiz as Quiz;
  },
};
