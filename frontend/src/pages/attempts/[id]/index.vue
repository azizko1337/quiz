<script setup lang="ts">
import Question from "@/components/Question.vue";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { attemptService } from "@/services/attemptService";
import { quizService } from "@/services/quizService";
import { questionService } from "@/services/questionService";

const route = useRoute();

const attempt = ref(null);
const quiz = ref(null);
const questions = ref([]);

onMounted(async () => {
  const { id: attemptId } = route.params;
  const _attempt = await attemptService.getQuizAttempt(attemptId);
  const _quiz = await quizService.getQuiz(_attempt.quizId);
  const _questions = await questionService.getQuestions(_attempt.quizId);

  attempt.value = _attempt;
  quiz.value = _quiz;
  questions.value = _questions;
});
</script>
<template>
  <ul class="w-full flex flex-col gap-8">
    <li
      v-for="question in questions"
      key="question.id"
      class="w-full flex justify-center"
    >
      <Question :question="question" />
    </li>
  </ul>
</template>
