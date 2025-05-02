<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import AttemptEntry from "@/components/AttemptEntry.vue";
import { quizService, type Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-vue-next";
import { attemptService, type QuizAttempt } from "@/services/attemptService";

const userStore = useUserStore();
const attempts = ref<QuizAttempt[]>([]);
const searchQuery = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchAttempts = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const userId = userStore.user?.id;
    const data = await attemptService.getQuizAttempts(userId ?? "");
    console.log(data);
    attempts.value = data;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Błąd podczas ładowania podejść";
    console.error(err);
    attempts.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAttempts();
});
</script>

<template>
  <div class="w-full flex flex-col min-h-[80vh]">
    <div
      class="flex max-md:flex-col max-md:items-start gap-4 justify-between items-center mb-6"
    >
      <h1 class="text-5xl font-bold">Moje podejścia</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center grow-1">
      <p>Ładowanie quizów...</p>
    </div>

    <div v-else-if="error" class="text-destructive grow-1">
      {{ error }}
    </div>

    <ul
      v-else-if="attempts.length > 0"
      class="w-full flex flex-col gap-6 items-center grow-1"
    >
      <li
        v-for="attempt in attempts"
        :key="attempt.id"
        class="w-full flex justify-center"
      >
        <AttemptEntry :attempt="attempt" />
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
