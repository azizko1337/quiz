import { dbPromise } from "../database/config";

export async function calculateAndUpdateScore(quizAttemptId: string) {
  const db = await dbPromise;

  // 1. Pobieramy quiz_id przypisane do tej próby
  const quizAttemptRow = await db.get<{ quiz_id: string }>(
    `SELECT quiz_id FROM quiz_attempts WHERE id = ?`,
    [quizAttemptId]
  );

  if (!quizAttemptRow) throw new Error("Nie znaleziono próby quizu.");

  const quizId = quizAttemptRow.quiz_id;

  // 2. Pobieramy wszystkie pytania w quizie
  const questions = await db.all<{ id: string }[]>(
    `SELECT id FROM questions WHERE quiz_id = ?`,
    [quizId]
  );

  let correctCount = 0;

  for (const question of questions) {
    const questionId = question.id;

    // Pobieramy poprawne odpowiedzi dla pytania
    const answers = await db.all<{ id: string; is_correct: boolean }[]>(
      `SELECT id, is_correct FROM answers WHERE question_id = ?`,
      [questionId]
    );
    const userAnswers = await db.all<
      { answer_id: string; answer_body: boolean }[]
    >(
      `SELECT answer_id, answer_body FROM question_attempts
       WHERE quiz_attempt_id = ? AND question_id = ? AND answer_id IS NOT NULL`,
      [quizAttemptId, questionId]
    );

    let isQuestionCorrect = true;
    for (const answer of answers) {
      const userAnswer = userAnswers.find(
        (userAnswer) => userAnswer.answer_id === answer.id
      );

      if (answer.is_correct) {
        if (!userAnswer || userAnswer.answer_body) {
          isQuestionCorrect = false;
          break;
        }
      } else {
        if (userAnswer && userAnswer.answer_body) {
          isQuestionCorrect = false;
          break;
        }
      }
    }
    if (isQuestionCorrect) correctCount++;
  }

  // 3. Aktualizujemy wynik w quiz_attempts
  await db.run(`UPDATE quiz_attempts SET score = ? WHERE id = ?`, [
    correctCount,
    quizAttemptId,
  ]);

  return {
    quizAttemptId,
    totalQuestions: questions.length,
    correctQuestions: correctCount,
    score: correctCount,
  };
}
