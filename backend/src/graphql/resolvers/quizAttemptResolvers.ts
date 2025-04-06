import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  checkAdmin,
  AuthorizationError,
} from "../../utils/auth";

export const quizAttemptQueries = {
  quizAttempt: async (_: any, { id }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    const attempt = await db.get(
      "SELECT id, quiz_id as quizId, user_id as userId, score, created_at as createdAt FROM quiz_attempts WHERE id = ?",
      [id]
    );

    if (!attempt) return null;

    // Check if user has permission to view this attempt
    if (user.role === "ADMIN" || user.id === attempt.userId.toString()) {
      return attempt;
    } else {
      throw new AuthorizationError(
        "You don't have permission to view this quiz attempt"
      );
    }
  },

  quizAttempts: async (_: any, { userId }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Check if user has permission to view these attempts
    if (user.id !== userId && user.role !== "ADMIN") {
      throw new AuthorizationError("You can only view your own quiz attempts");
    }

    const db = await dbPromise;
    return db.all(
      "SELECT id, quiz_id as quizId, user_id as userId, score, created_at as createdAt FROM quiz_attempts WHERE user_id = ?",
      [userId]
    );
  },
};

export const quizAttemptMutations = {
  persistQuizAttempt: async (
    _: any,
    { quizId, userId, score }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Check if user has permission to create/update this attempt
    if (user.id !== userId && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "You can only create or update your own quiz attempts"
      );
    }

    const db = await dbPromise;

    // Check if an attempt already exists for this quiz and user
    const existingAttempt = await db.get(
      "SELECT id FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?",
      [quizId, userId]
    );

    if (existingAttempt) {
      // Update existing attempt
      await db.run("UPDATE quiz_attempts SET score = ? WHERE id = ?", [
        score,
        existingAttempt.id,
      ]);

      // Return the updated attempt
      return db.get(
        "SELECT id, quiz_id as quizId, user_id as userId, score, created_at as createdAt FROM quiz_attempts WHERE id = ?",
        [existingAttempt.id]
      );
    } else {
      // Create new attempt
      const result = await db.run(
        "INSERT INTO quiz_attempts (quiz_id, user_id, score) VALUES (?, ?, ?)",
        [quizId, userId, score]
      );

      return {
        id: result.lastID,
        quizId,
        userId,
        score,
        createdAt: new Date().toISOString(),
      };
    }
  },

  deleteQuizAttempt: async (_: any, { id }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Get the attempt to check ownership
    const attempt = await db.get(
      "SELECT user_id as userId FROM quiz_attempts WHERE id = ?",
      [id]
    );

    if (!attempt) return false;

    // Check if user has permission to delete this attempt
    if (user.role !== "ADMIN" && user.id !== attempt.userId.toString()) {
      throw new AuthorizationError(
        "You can only delete your own quiz attempts"
      );
    }

    const result = await db.run("DELETE FROM quiz_attempts WHERE id = ?", [id]);
    if (!result?.changes) {
      return false;
    }
    return result.changes > 0;
  },
};
