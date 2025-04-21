import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  checkAdmin,
  AuthorizationError,
} from "../../utils/auth";
import { v4 as uuidv4 } from "uuid";

export const answerQueries = {
  answer: async (_: any, { id }: any, { authUser }: any) => {
    const db = await dbPromise;
    const answer = await db.get(
      "SELECT id, question_id as questionId, answer, is_correct as isCorrect, image, created_at as createdAt FROM answers WHERE id = ?",
      [id]
    );

    if (!answer) return null;

    // Check if the quiz is public or if user is authorized to view it
    if (!(await canViewAnswer(answer.questionId, authUser))) {
      // Hide the correctness of the answer if not authorized
      return {
        ...answer,
        isCorrect: undefined,
      };
    }

    return answer;
  },

  answers: async (_: any, { questionId }: any, { authUser }: any) => {
    const db = await dbPromise;
    const answers = await db.all(
      "SELECT id, question_id as questionId, answer, is_correct as isCorrect, image, created_at as createdAt FROM answers WHERE question_id = ?",
      [questionId]
    );

    // Check if the quiz is public or if user is authorized to view it
    if (!(await canViewAnswer(questionId, authUser))) {
      // Hide the correctness of answers if not authorized
      return answers.map((answer) => ({
        ...answer,
        isCorrect: undefined,
      }));
    }

    return answers;
  },
};

export const answerMutations = {
  createAnswer: async (
    _: any,
    { questionId, answer, isCorrect, image }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);

    // Check if user has permission to create answer for this question
    if (!(await canModifyQuestionContent(questionId, user.id, user.role))) {
      throw new AuthorizationError(
        "You don't have permission to create answers for this question"
      );
    }

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO answers (id, question_id, answer, is_correct, image) VALUES (?, ?, ?, ?, ?)",
      [uuidv4(), questionId, answer, isCorrect, image]
    );
    return {
      id: result.lastID,
      questionId,
      answer,
      isCorrect,
      image,
      createdAt: new Date().toISOString(),
    };
  },

  updateAnswer: async (
    _: any,
    { id, answer, isCorrect, image }: any,
    { authUser }: any
  ) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Get the answer to check question ownership
    const answerData = await db.get(
      "SELECT question_id as questionId FROM answers WHERE id = ?",
      [id]
    );
    if (!answerData) return null;

    // Check if user has permission to update this answer
    if (
      !(await canModifyQuestionContent(
        answerData.questionId,
        user.id,
        user.role
      ))
    ) {
      throw new AuthorizationError(
        "You don't have permission to update this answer"
      );
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (answer) {
      updates.push("answer = ?");
      params.push(answer);
    }

    if (isCorrect !== undefined) {
      updates.push("is_correct = ?");
      params.push(isCorrect);
    }

    if (image !== undefined) {
      updates.push("image = ?");
      params.push(image);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.run(
        `UPDATE answers SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    return db.get(
      "SELECT id, question_id as questionId, answer, is_correct as isCorrect, image, created_at as createdAt FROM answers WHERE id = ?",
      [id]
    );
  },

  deleteAnswer: async (_: any, { id }: any, { authUser }: any) => {
    // Ensure user is authenticated
    const user = checkAuthenticated(authUser);
    const db = await dbPromise;

    // Get the answer to check question ownership
    const answer = await db.get(
      "SELECT question_id as questionId FROM answers WHERE id = ?",
      [id]
    );
    if (!answer) return false;

    // Check if user has permission to delete this answer
    if (
      !(await canModifyQuestionContent(answer.questionId, user.id, user.role))
    ) {
      throw new AuthorizationError(
        "You don't have permission to delete this answer"
      );
    }

    const result = await db.run("DELETE FROM answers WHERE id = ?", [id]);
    if (!result?.changes) {
      return false;
    }
    return result.changes > 0;
  },
};

// Helper function to check if a user can modify a question's content
async function canModifyQuestionContent(
  questionId: string,
  userId: string,
  userRole: string
): Promise<boolean> {
  if (userRole === "ADMIN") return true;

  const db = await dbPromise;

  // Get the quiz id for this question
  const question = await db.get(
    "SELECT quiz_id as quizId FROM questions WHERE id = ?",
    [questionId]
  );
  if (!question) {
    console.log("no pytanie");
    return false;
  }

  // Check if user is the owner of the quiz
  const quiz = await db.get("SELECT author_id FROM quizzes WHERE id = ?", [
    question.quizId,
  ]);
  return quiz && quiz.author_id === userId;
}

// Helper function to check if a user can view answer details (including correctness)
async function canViewAnswer(
  questionId: string,
  authUser: any
): Promise<boolean> {
  const db = await dbPromise;

  // If user is admin, they can see all answers with correctness
  if (authUser && authUser.role === "ADMIN") return true;

  // Get the quiz for this question
  const question = await db.get(
    "SELECT quiz_id as quizId FROM questions WHERE id = ?",
    [questionId]
  );
  if (!question) return false;

  // Check if quiz is public
  const quiz = await db.get(
    "SELECT isPublic, author_id FROM quizzes WHERE id = ?",
    [question.quizId]
  );

  // If user is quiz owner, they can see all answers with correctness
  if (authUser && quiz && quiz.author_id.toString() === authUser.id)
    return true;

  // Public quizzes can be viewed with correctness info by owners only
  return false;
}
