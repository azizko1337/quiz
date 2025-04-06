import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  checkAdmin,
  AuthorizationError,
} from "../../utils/auth";

export const questionAttemptQueries = {
  questionAttempt: async (_: any, { id }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Get the question attempt
    const attempt = await db.get(
      "SELECT id, question_id as questionId, quiz_attempt_id as quizAttemptId, answer_id as answerId, answer_body as answerBody, created_at as createdAt FROM question_attempts WHERE id = ?",
      [id]
    );

    if (!attempt) return null;

    // Check if user has permission to view this question attempt
    if (user.role !== "ADMIN") {
      // Get the quiz attempt to verify ownership
      const quizAttempt = await db.get(
        "SELECT user_id as userId FROM quiz_attempts WHERE id = ?",
        [attempt.quizAttemptId]
      );

      if (!quizAttempt || quizAttempt.userId.toString() !== user.id) {
        throw new AuthorizationError(
          "You don't have permission to view this question attempt"
        );
      }
    }

    return attempt;
  },

  questionAttempts: async (
    _: any,
    { quizAttemptId }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Check if user has permission to view question attempts for this quiz attempt
    if (user.role !== "ADMIN") {
      // Get the quiz attempt to verify ownership
      const quizAttempt = await db.get(
        "SELECT user_id as userId FROM quiz_attempts WHERE id = ?",
        [quizAttemptId]
      );

      if (!quizAttempt || quizAttempt.userId.toString() !== user.id) {
        throw new AuthorizationError(
          "You don't have permission to view these question attempts"
        );
      }
    }

    return db.all(
      "SELECT id, question_id as questionId, quiz_attempt_id as quizAttemptId, answer_id as answerId, answer_body as answerBody, created_at as createdAt FROM question_attempts WHERE quiz_attempt_id = ?",
      [quizAttemptId]
    );
  },
};

export const questionAttemptMutations = {
  persistQuestionAttempt: async (
    _: any,
    { questionId, quizAttemptId, answerId, answerBody }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Check if user has permission to modify this quiz attempt
    if (user.role !== "ADMIN") {
      // Get the quiz attempt to verify ownership
      const quizAttempt = await db.get(
        "SELECT user_id as userId FROM quiz_attempts WHERE id = ?",
        [quizAttemptId]
      );

      if (!quizAttempt || quizAttempt.userId.toString() !== user.id) {
        throw new AuthorizationError(
          "You can only answer questions in your own quiz attempts"
        );
      }
    }

    // Check if an attempt already exists
    const existingAttempt = await db.get(
      "SELECT id FROM question_attempts WHERE question_id = ? AND quiz_attempt_id = ?",
      [questionId, quizAttemptId]
    );

    if (existingAttempt) {
      // Update existing attempt
      await db.run(
        "UPDATE question_attempts SET answer_id = ?, answer_body = ? WHERE id = ?",
        [
          answerId || null,
          answerBody !== undefined ? answerBody : null,
          existingAttempt.id,
        ]
      );

      // Return the updated attempt
      return db.get(
        "SELECT id, question_id as questionId, quiz_attempt_id as quizAttemptId, answer_id as answerId, answer_body as answerBody, created_at as createdAt FROM question_attempts WHERE id = ?",
        [existingAttempt.id]
      );
    } else {
      // Create new attempt
      const result = await db.run(
        "INSERT INTO question_attempts (question_id, quiz_attempt_id, answer_id, answer_body) VALUES (?, ?, ?, ?)",
        [
          questionId,
          quizAttemptId,
          answerId || null,
          answerBody !== undefined ? answerBody : null,
        ]
      );

      return {
        id: result.lastID,
        questionId,
        quizAttemptId,
        answerId: answerId || null,
        answerBody: answerBody !== undefined ? answerBody : null,
        createdAt: new Date().toISOString(),
      };
    }
  },
};
