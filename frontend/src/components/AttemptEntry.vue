<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { RouterLink, useRouter } from "vue-router";
import { quizService, type Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import { Play, Pencil, Plus } from "lucide-vue-next";
import { attemptService, type QuizAttempt } from "@/services/attemptService";
import { ref, onMounted } from "vue";
import { questionService, type Question } from "@/services/questionService";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "vue-sonner";

const { attempt } = defineProps<{
  attempt: QuizAttempt;
}>();

const quiz = ref<Quiz | null>(null);
const questions = ref<Question[]>([]);

const userStore = useUserStore();
const router = useRouter();

// Format date to a more readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function continueQuiz() {
  if (quiz.value) {
    const quizAttempt = await attemptService.persistQuizAttempt(
      quiz.value.id,
      userStore.user?.id ?? ""
    );
    await router.push(`/attempts/${quizAttempt.id}`);
  }
}

async function startQuiz() {
  if (quiz.value) {
    const quizAttempt = await attemptService.createQuizAttempt(
      quiz.value.id,
      userStore.user?.id ?? ""
    );
    await router.push(`/attempts/${quizAttempt.id}`);
  }
}

async function deleteAttempt() {
  if (attempt) {
    try {
      await attemptService.deleteQuizAttempt(attempt.id);
      await window.location.reload();
    } catch (error) {
      console.error("Failed to delete attempt:", error);
      toast.error("Nie udało się usunąć podejścia");
    }
  }
}

onMounted(async () => {
  quiz.value = await quizService.getQuiz(attempt.quizId);
  questions.value = await questionService.getQuestions(attempt.quizId);
  console.log("qqq", questions.value.length);
});
</script>
<template>
  <ContextMenu>
    <ContextMenuTrigger class="w-full max-w-[650px]"
      ><div
        class="flex gap-8 justify-between w-full rounded-lg px-4 py-3 shadow-2xl border-2 cursor-context-menu"
      >
        <div class="flex flex-col">
          <h2 class="text-lg font-bold">{{ quiz?.title }}</h2>
          <p v-if="quiz?.description" class="text-md text-gray-500">
            {{ quiz?.description }}
          </p>
          <div class="grow p-1"></div>
          <p class="text-sm text-accent">
            Wynik:
            <Badge
              >{{
                Math.round(((attempt?.score ?? 0) / questions.length) * 100)
              }}%</Badge
            >
          </p>
          <p class="text-sm text-accent">
            Podejście rozpoczęte
            <Badge>{{ formatDate(attempt?.createdAt ?? "") }}</Badge>
          </p>
          <p class="text-sm text-accent">
            <Badge v-if="quiz?.isPublic" variant="outline">Publiczny</Badge>
            <Badge v-else variant="outline">Niepubliczny</Badge>
          </p>
        </div>
        <div class="flex flex-col justify-end items-stretch gap-2">
          <Button class="border-1 w-full" @click="continueQuiz"
            >Uruchom podejście <Play :size="14"
          /></Button>
          <Button class="border-1 w-full" @click="startQuiz"
            >Nowe podejście <Plus :size="14"
          /></Button>
        </div></div
    ></ContextMenuTrigger>
    <ContextMenuContent class="bg-white">
      <ContextMenuItem
        class="hover:bg-blue-200 transition-colors cursor-pointer"
        @click="deleteAttempt"
        >Usuń podejście</ContextMenuItem
      >
      <RouterLink :to="`/quizzes/${attempt.quizId}/edit`">
        <ContextMenuItem
          class="hover:bg-blue-200 transition-colors cursor-pointer"
          v-if="userStore?.user?.id === quiz?.authorId"
          >Edytuj quiz</ContextMenuItem
        >
      </RouterLink>
    </ContextMenuContent>
  </ContextMenu>
</template>
