import { dbPromise } from "../../database/config";
import {
  checkAuthenticated,
  checkAdmin,
  AuthorizationError,
} from "../../utils/auth";
import AiService from "../../services/AiService";
import { v4 as uuidv4 } from "uuid";

export const aiMutations = {
  generateQuiz: async (
    _: any,
    { title, description, isPublic, numberOfQuestions, additionalInfo }: any,
    { authUser }: any
  ) => {
    const user = checkAuthenticated(authUser);

    const aiService = new AiService();
    const questions = await aiService.generateQuiz(
      title,
      description,
      numberOfQuestions,
      additionalInfo
    );

    // create quiz
    const db = await dbPromise;
    const quizId = uuidv4();
    const quiz = await db.run(
      "INSERT INTO quizzes (id, author_id, title, description, isPublic) VALUES (?, ?, ?, ?, ?)",
      [quizId, user.id, title, description, isPublic]
    );

    for (const question of questions) {
      const questionId = uuidv4();
      await db.run(
        "INSERT INTO questions (id, quiz_id, question, image) VALUES (?, ?, ?, ?)",
        [questionId, quizId, question.question, question.image]
      );

      for (const answer of question.answers) {
        const answerId = uuidv4();
        await db.run(
          "INSERT INTO answers (id, question_id, answer, is_correct, image) VALUES (?, ?, ?, ?, ?)",
          [answerId, questionId, answer.answer, answer.isCorrect, answer.image]
        );
      }
    }

    return {
      id: quizId,
      authorId: user.id,
      title,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
    };
  },
};
