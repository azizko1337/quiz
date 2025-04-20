<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import QuizEntry from "@/components/QuizEntry.vue";
import { quizService, type Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-vue-next";

const userStore = useUserStore();
const quizzes = ref<Quiz[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");

const fetchQuizzes = async (searchTerm?: string) => {
  try {
    isLoading.value = true;
    error.value = null;
    const userId = userStore.user?.id;
    const data = await quizService.getQuizzes();
    if (searchTerm) {
      quizzes.value = data.filter((quiz: Quiz) => {
        return (
          quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.author?.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    } else {
      quizzes.value = data;
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Błąd podczas ładowania quizów";
    console.error(err);
    quizzes.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchQuizzes();
});

watch(searchQuery, (newQuery) => {
  fetchQuizzes(newQuery || undefined);
});
</script>

<template>
  <div class="w-full flex flex-col min-h-[80vh]">
    <div
      class="flex max-md:flex-col max-md:items-start gap-4 justify-between items-center mb-6"
    >
      <h1 class="text-5xl font-bold">Publiczne quizy</h1>
    </div>

    <!-- Search Input -->
    <div class="mb-6">
      <Input
        type="text"
        placeholder="Wyszukaj quiz..."
        v-model="searchQuery"
        class="max-w-sm backdrop-blur-lg backdrop-brightness-50"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center grow-1">
      <p>Ładowanie quizów...</p>
    </div>

    <div v-else-if="error" class="text-destructive grow-1">
      {{ error }}
    </div>

    <ul
      v-else-if="quizzes.length > 0"
      class="w-full flex flex-col gap-6 items-center grow-1"
    >
      <li
        v-for="quiz in quizzes"
        :key="quiz.id"
        class="w-full flex justify-center"
      >
        <QuizEntry :quiz="quiz" />
      </li>
    </ul>

    <div v-else class="text-center py-10 grow-1">
      <p v-if="!searchQuery" class="text-muted-foreground">Brak quizów.</p>
      <p v-else class="text-muted-foreground">
        Nie znaleziono quizów pasujących do wyszukiwania.
      </p>
    </div>
  </div>
</template>
