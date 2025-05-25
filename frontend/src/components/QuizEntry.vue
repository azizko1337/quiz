<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { RouterLink, useRouter } from "vue-router";
import type { Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import { Play, Pencil } from "lucide-vue-next";
import { attemptService } from "@/services/attemptService";

const { quiz } = defineProps<{
  quiz: Quiz;
}>();

const userStore = useUserStore();
const router = useRouter();

// Format date to a more readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function startQuiz() {
  const quizAttempt = await attemptService.createQuizAttempt(
    quiz.id,
    userStore.user?.id ?? ""
  );
  await router.push(`/attempts/${quizAttempt.id}`);
}

console.log(userStore, quiz);
</script>
<template>
  <div
    class="flex gap-8 justify-between w-full max-w-[550px] rounded-lg px-4 py-3 shadow-2xl border-2"
  >
    <div class="flex flex-col">
      <h2 class="text-lg font-bold">{{ quiz.title }}</h2>
      <p v-if="quiz.description" class="text-md text-gray-500">
        {{ quiz.description }}
      </p>
      <div class="grow p-1"></div>
      <p class="text-sm text-accent">
        Utworzono przez
        <RouterLink :to="`/profiles/${quiz.author.id}`"
          ><Badge>{{ quiz.author?.username || "Unknown" }}</Badge></RouterLink
        >,
        <Badge>{{ formatDate(quiz.createdAt) }}</Badge>
        <Badge v-if="quiz.isPublic" variant="outline">Publiczny</Badge>
        <Badge v-else variant="outline">Niepubliczny</Badge>
      </p>
    </div>
    <div class="flex flex-col justify-end items-stretch gap-2">
      <RouterLink
        v-if="quiz.authorId === userStore?.user?.id"
        :to="`/quizzes/${quiz.id}/edit`"
      >
        <Button class="border-1 w-full" variant="secondary"
          >Edytuj <Pencil :size="14"
        /></Button>
      </RouterLink>
      <Button class="border-1 w-full" @click="startQuiz"
        >Start <Play :size="14"
      /></Button>
    </div>
  </div>
</template>
