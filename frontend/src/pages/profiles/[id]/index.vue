<script setup lang="ts">
import { onBeforeMount, computed, onMounted, ref, watch } from "vue";
import QuizEntry from "@/components/QuizEntry.vue";
import { quizService, type Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import type { User } from "@/services/userService";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { userService } from "@/services/userService";

const userStore = useUserStore();
const quizzes = ref<Quiz[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");
const route = useRoute();
const user = ref<User | null>(null);

const fetchQuizzes = async (searchTerm?: string) => {
  try {
    isLoading.value = true;
    error.value = null;
    quizzes.value = [];
    if (!user.value) {
      error.value = "Nie znaleziono użytkownika.";
      return;
    }
    const data = await quizService.getQuizzes(user.value?.id);
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
    quizzes.value = [...quizzes.value].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Błąd podczas ładowania quizów";
    console.error(err);
    quizzes.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!route.params.id) {
    error.value = "Nie znaleziono użytkownika.";
    return;
  }
  user.value = await userService.getUser(route.params.id as string);

  fetchQuizzes();
});

watch(searchQuery, (newQuery) => {
  fetchQuizzes(newQuery || undefined);
});

const isProfileMine = computed(() => {
  return user.value?.id == userStore.user?.id;
});
</script>

<template>
  <div class="w-full flex flex-col min-h-[80vh]">
    <div
      v-if="isProfileMine"
      class="flex max-md:flex-col max-md:items-start gap-4 justify-between items-center mb-6"
    >
      <h1 class="text-5xl font-bold">Twoje quizy</h1>
      <RouterLink to="/quizzes/create">
        <Button class="border-1">Utwórz nowy quiz <Plus :size="16" /></Button>
      </RouterLink>
    </div>
    <div
      v-else
      class="flex max-md:flex-col max-md:items-start gap-4 justify-between items-center mb-6"
    >
      <h1 class="text-5xl font-bold">Quizy użytkownika {{ user?.username }}</h1>
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

    <div v-if="isLoading" class="flex justify-center text-center grow-1">
      <p>Ładowanie quizów...</p>
    </div>

    <div
      v-else-if="error"
      class="text-destructive justify-center text-center grow-1"
    >
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
      <p v-if="searchQuery" class="text-muted-foreground">
        Nie znaleziono quizów pasujących do wyszukiwania.
      </p>
      <p v-else-if="!isProfileMine" class="text-muted-foreground">
        Użytkownik nie ma żadnych quizów.
      </p>
      <div v-else class="flex flex-col items-center">
        <p class="text-muted-foreground">Nie masz jeszcze żadnych quizów.</p>
        <RouterLink
          v-if="!searchQuery"
          to="/quizzes/create"
          class="mt-4 inline-block"
        >
          <Button class="border-1">Utwórz pierwszy quiz</Button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
