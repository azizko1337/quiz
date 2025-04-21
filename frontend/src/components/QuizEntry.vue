<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { RouterLink } from "vue-router";
import type { Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";
import { Play, Pencil } from "lucide-vue-next";

const { quiz } = defineProps<{
  quiz: Quiz;
}>();

const userStore = useUserStore();

// Format date to a more readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

console.log(userStore, quiz);
</script>
<template>
  <div
    class="flex gap-8 justify-between w-full max-w-[500px] rounded-lg px-4 py-2 shadow-2xl border-b-1"
  >
    <div class="flex flex-col">
      <h2 class="text-lg font-bold">{{ quiz.title }}</h2>
      <p v-if="quiz.description" class="text-md text-gray-500">
        {{ quiz.description }}
      </p>
      <div class="grow p-1"></div>
      <p class="text-sm text-accent">
        Created by <Badge>{{ quiz.author?.username || "Unknown" }}</Badge
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
        <Button class="border-b-1 w-full" variant="secondary"
          >Edit <Pencil :size="14"
        /></Button>
      </RouterLink>
      <RouterLink :to="`/quizzes/${quiz.id}`">
        <Button class="border-b-1 w-full">Start <Play :size="14" /></Button>
      </RouterLink>
    </div>
  </div>
</template>
