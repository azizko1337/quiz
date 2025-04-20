import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  ensureQuizOwner,
  AuthorizationError,
} from "../../utils/auth";

export const quizQueries = {
  quiz: async (_: any, { id }: any, { authUser }: any) => {
    const user = checkAuthenticated(authUser);

    const db = await dbPromise;
    const quiz = await db.get(
      "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes WHERE id = ?",
      [id]
    );

    if (!quiz) return null;

    // Allow access if quiz is public or if user is the owner
    if (quiz.isPublic || user.id === quiz.authorId || user.role === "ADMIN") {
      return quiz;
    } else {
      throw new AuthorizationError(
        "You don't have permission to access this quiz"
      );
    }
  },
  quizzes: async (_: any, { authorId }: any, { authUser }: any) => {
    const db = await dbPromise;

    // If authorId is provided, we're looking at a specific user's quizzes
    if (authorId) {
      // If user is viewing their own quizzes - return all
      if (authUser && (authUser.id === authorId || authUser.role === "ADMIN")) {
        return db.all(
          "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes WHERE author_id = ?",
          [authorId]
        );
      } else {
        // User is viewing someone else's quizzes - return only public ones
        return db.all(
          "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes WHERE author_id = ? AND isPublic = 1",
          [authorId]
        );
      }
    }

    // If no authorId provided, handle general quiz listing
    if (authUser) {
      if (authUser.role === "ADMIN") {
        return db.all(
          "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes"
        );
      } else {
        // Authenticated users see all public quizzes and their own private quizzes
        return db.all(
          "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes WHERE isPublic = 1 OR author_id = ?",
          [authUser.id]
        );
      }
    } else {
      // Non-authenticated users only see public quizzes
      return db.all(
        "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes WHERE isPublic = 1"
      );
    }
  },
};

export const quizMutations = {
  createQuiz: async (
    _: any,
    { authorId, title, isPublic, description }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Ensure user is creating a quiz for themselves
    if (user.id !== authorId && user.role !== "ADMIN") {
      throw new Error("You can only create quizzes for your own account");
    }

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO quizzes (author_id, title, description, isPublic) VALUES (?, ?, ?, ?)",
      [authorId, title, description, isPublic]
    );
    return {
      id: result.lastID,
      authorId,
      title,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
    };
  },
  updateQuiz: async (
    _: any,
    { id, title, description }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Ensure user owns this quiz
    if (user.role !== "ADMIN") {
      await ensureQuizOwner(id, user.id);
    }

    const db = await dbPromise;
    const updates: string[] = [];
    const params: any[] = [];

    if (title) {
      updates.push("title = ?");
      params.push(title);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.run(
        `UPDATE quizzes SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    return db.get(
      "SELECT id, author_id as authorId, title, description, isPublic, created_at as createdAt FROM quizzes WHERE id = ?",
      [id]
    );
  },
  deleteQuiz: async (_: any, { id }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Ensure user owns this quiz
    if (user.role !== "ADMIN") {
      await ensureQuizOwner(id, user.id);
    }

    const db = await dbPromise;
    const result = await db.run("DELETE FROM quizzes WHERE id = ?", [id]);
    if (!result.changes) return false;
    return result.changes > 0;
  },
};
