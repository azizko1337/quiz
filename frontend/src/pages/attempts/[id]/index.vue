<script setup lang="ts">
import QuestionComponent from "@/components/Question.vue";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { attemptService } from "@/services/attemptService";
import { quizService } from "@/services/quizService";
import { questionService } from "@/services/questionService";
import type { Question } from "@/services/questionService";

const route = useRoute();

const attempt = ref(null);
const quiz = ref(null);
const questions = ref<Question[]>([]);

onMounted(async () => {
  const { id: attemptId } = route.params as { id: string };
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
      v-for="(question, i) in questions"
      :key="question.id"
      class="w-full flex justify-center"
    >
      <QuestionComponent
        v-if="quiz && attempt"
        :question="question"
        :quiz="quiz"
        :quiz-attempt="attempt"
        :index="i + 1"
      />
    </li>
  </ul>
</template>
