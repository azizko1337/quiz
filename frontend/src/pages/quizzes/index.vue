<script setup lang="ts">
import { onMounted, ref } from "vue";
import QuizEntry from "@/components/QuizEntry.vue";
import { quizService, type Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";

const userStore = useUserStore();
const quizzes = ref<Quiz[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    isLoading.value = true;
    if (userStore.user) {
      // Fetch quizzes for the current user
      quizzes.value = await quizService.getQuizzes(userStore.user.id);
    } else {
      // Fetch public quizzes if not logged in
      quizzes.value = await quizService.getQuizzes();
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Błąd podczas ładowania quizów";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Moje quizy</h1>
      <RouterLink to="/quizzes/create">
        <Button>Utwórz nowy quiz</Button>
      </RouterLink>
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <p>Ładowanie quizów...</p>
    </div>

    <div v-else-if="error" class="text-destructive">
      {{ error }}
    </div>

    <ul v-else-if="quizzes.length > 0" class="w-full flex flex-col gap-6">
      <li v-for="quiz in quizzes" :key="quiz.id">
        <QuizEntry :quiz="quiz" />
      </li>
    </ul>

    <div v-else class="text-center py-10">
      <p class="text-muted-foreground">Nie masz jeszcze żadnych quizów.</p>
      <RouterLink to="/quizzes/create" class="mt-4 inline-block">
        <Button>Utwórz pierwszy quiz</Button>
      </RouterLink>
    </div>
  </div>
</template>
