import { userQueries, userMutations } from "./userResolvers";
import { quizQueries, quizMutations } from "./quizResolvers";
import { questionQueries, questionMutations } from "./questionResolvers";
import { answerQueries, answerMutations } from "./answerResolvers";
import {
  quizAttemptQueries,
  quizAttemptMutations,
} from "./quizAttemptResolvers";
import {
  questionAttemptQueries,
  questionAttemptMutations,
} from "./questionAttemptResolvers";
import { authMutations } from "./authResolvers";
import { aiMutations } from "./aiResolvers";

export const resolvers = {
  Query: {
    ...userQueries,
    ...quizQueries,
    ...questionQueries,
    ...answerQueries,
    ...quizAttemptQueries,
    ...questionAttemptQueries,
  },
  Mutation: {
    ...userMutations,
    ...quizMutations,
    ...questionMutations,
    ...answerMutations,
    ...quizAttemptMutations,
    ...questionAttemptMutations,
    ...authMutations,
    ...aiMutations,
  },
};
