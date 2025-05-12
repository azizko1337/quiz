import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  checkAdmin,
  ensureQuizOwner,
  AuthorizationError,
} from "../../utils/auth";
import { v4 as uuidv4 } from "uuid";

export const questionQueries = {
  question: async (_: any, { id }: any, { authUser }: any) => {
    // Question viewing doesn't need authentication as it depends on quiz visibility
    const db = await dbPromise;

    // First get the question
    const question = await db.get(
      "SELECT id, quiz_id as quizId, question, image, created_at as createdAt FROM questions WHERE id = ?",
      [id]
    );

    if (!question) return null;

    // Then check if the user can access the quiz this question belongs to
    if (authUser) {
      // If user is admin or quiz owner, they can access any question
      if (
        authUser.role === "ADMIN" ||
        (await isUserQuizOwner(question.quizId, authUser.id))
      ) {
        return question;
      }
    }

    // Check if quiz is public
    const quiz = await db.get("SELECT isPublic FROM quizzes WHERE id = ?", [
      question.quizId,
    ]);
    if (quiz && quiz.isPublic) {
      return question;
    }

    throw new AuthorizationError(
      "You don't have permission to view this question"
    );
  },

  questions: async (_: any, { quizId }: any, { authUser }: any) => {
    const db = await dbPromise;

    // First check if the user can access the quiz these questions belong to
    if (authUser) {
      // If user is admin or quiz owner, they can access all questions
      if (
        authUser.role === "ADMIN" ||
        (await isUserQuizOwner(quizId, authUser.id))
      ) {
        return db.all(
          "SELECT id, quiz_id as quizId, question, image, created_at as createdAt FROM questions WHERE quiz_id = ?",
          [quizId]
        );
      }
    }

    // Check if quiz is public
    const quiz = await db.get("SELECT isPublic FROM quizzes WHERE id = ?", [
      quizId,
    ]);
    if (quiz && quiz.isPublic) {
      return db.all(
        "SELECT id, quiz_id as quizId, question, image, created_at as createdAt FROM questions WHERE quiz_id = ?",
        [quizId]
      );
    }

    throw new AuthorizationError(
      "You don't have permission to view these questions"
    );
  },
};

export const questionMutations = {
  createQuestion: async (
    _: any,
    { quizId, question, image }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Check if user is admin or quiz owner
    if (user.role !== "ADMIN") {
      await ensureQuizOwner(quizId, user.id);
    }

    const db = await dbPromise;
    const newQuestionId = uuidv4(); // Generate UUID before insertion
    await db.run(
      "INSERT INTO questions (id, quiz_id, question, image) VALUES (?, ?, ?, ?)",
      [newQuestionId, quizId, question, image] // Use the generated UUID
    );

    // Return the actual ID that was inserted
    return {
      id: newQuestionId, // Return the generated UUID
      quizId,
      question,
      image,
      createdAt: new Date().toISOString(),
    };
  },

  updateQuestion: async (
    _: any,
    { id, question, image }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Get question to check quiz ownership
    const questionData = await db.get(
      "SELECT quiz_id as quizId FROM questions WHERE id = ?",
      [id]
    );
    if (!questionData) return null;

    // Check if user is admin or quiz owner
    if (user.role !== "ADMIN") {
      await ensureQuizOwner(questionData.quizId, user.id);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (question) {
      updates.push("question = ?");
      params.push(question);
    }

    if (image !== undefined) {
      updates.push("image = ?");
      params.push(image);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.run(
        `UPDATE questions SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    return db.get(
      "SELECT id, quiz_id as quizId, question, image, created_at as createdAt FROM questions WHERE id = ?",
      [id]
    );
  },

  deleteQuestion: async (_: any, { id }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Get question to check quiz ownership
    const question = await db.get(
      "SELECT quiz_id as quizId FROM questions WHERE id = ?",
      [id]
    );
    if (!question) return false;

    // Check if user is admin or quiz owner
    if (user.role !== "ADMIN") {
      await ensureQuizOwner(question.quizId, user.id);
    }

    const result = await db.run("DELETE FROM questions WHERE id = ?", [id]);
    if (!result?.changes) {
      return false;
    }
    return result.changes > 0;
  },
};

// Helper function to check if user is the owner of a quiz
async function isUserQuizOwner(
  quizId: string,
  userId: string
): Promise<boolean> {
  const db = await dbPromise;
  const quiz = await db.get("SELECT author_id FROM quizzes WHERE id = ?", [
    quizId,
  ]);
  return quiz && quiz.author_id.toString() === userId;
}
