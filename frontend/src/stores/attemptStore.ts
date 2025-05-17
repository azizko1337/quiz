import { defineStore } from "pinia";
import { ref } from "vue";
import { attemptService, type QuizAttempt } from "@/services/attemptService";

export const useAttemptStore = defineStore("attempt", () => {
  const attempt = ref<QuizAttempt | null>(null);

  async function getScore() {
    return attempt.value?.score;
  }

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
  }

  return {
    attempt,
    getScore,
    set,
    update,
  };
});
