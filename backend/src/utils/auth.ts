import { AuthUser } from "../middleware/auth";
import { dbPromise } from "../database/config";

export class AuthenticationError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function checkAuthenticated(authUser: AuthUser | null) {
  if (!authUser) {
    throw new AuthenticationError();
  }
  return authUser;
}

export function checkAdmin(authUser: AuthUser | null) {
  const user = checkAuthenticated(authUser);
  if (user.role !== "ADMIN") {
    throw new AuthorizationError("Admin privileges required");
  }
  return user;
}

export async function isQuizOwner(
  quizId: string,
  userId: string
): Promise<boolean> {
  const db = await dbPromise;
  const quiz = await db.get("SELECT author_id FROM quizzes WHERE id = ?", [
    quizId,
  ]);
  return quiz && quiz.author_id === userId;
}

export async function ensureQuizOwner(
  quizId: string,
  userId: string
): Promise<void> {
  if (!(await isQuizOwner(quizId, userId))) {
    throw new AuthorizationError(
      "You don't have permission to modify this quiz"
    );
  }
}
