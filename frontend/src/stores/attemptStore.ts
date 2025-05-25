import { defineStore } from "pinia";
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { attemptService, type QuizAttempt } from "@/services/attemptService";
import { quizService, type Quiz } from "@/services/quizService";
import { questionService, type Question } from "@/services/questionService";

export const useAttemptStore = defineStore("attempt", () => {
  const attempt = ref<QuizAttempt | null>(null);
  const quiz = ref<Quiz | null>(null);
  const questions = ref<Array<Question>>([]);
  const sessionTime = ref<number>(0);
  const intervalId = ref<number | null>(null);

  async function update() {
    if (attempt.value) {
      const _attempt = await attemptService.getQuizAttempt(attempt.value.id);
      if (_attempt) {
        attempt.value = _attempt;
      }
    }
  }

  function set(newAttempt: QuizAttempt) {
    attempt.value = newAttempt;
    sessionTime.value = 0;
  }

  onMounted(() => {
    intervalId.value = window.setInterval(() => {
      sessionTime.value++;
    }, 1000);
  });

  onUnmounted(() => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  });

  const score = computed(() => {
    return attempt.value && questions.value.length > 0
      ? Math.round(
          ((attempt?.value?.score ?? 0) * 100) / questions.value.length
        )
      : 0;
  });

  watch(
    () => attempt.value,
    async (newAttempt) => {
      if (newAttempt) {
        quiz.value = await quizService.getQuiz(newAttempt.quizId);
        questions.value = await questionService.getQuestions(newAttempt.quizId);
      }
    }
  );

  return {
    attempt,
    quiz,
    questions,
    score,
    sessionTime,
    set,
    update,
  };
});
