<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { RouterLink } from "vue-router";
import type { Quiz } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";

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
</script>
<template>
  <div class="flex justify-between w-full max-w-[500px]">
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
        <Badge v-if="quiz.public" variant="secondary">Publiczny</Badge>
        <Badge v-else variant="outline">Prywatny</Badge>
      </p>
    </div>
    <div class="flex flex-col justify-end">
      <RouterLink
        v-if="+quiz.authorId === Number(userStore?.user?.id)"
        :to="`/quizzes/${quiz.id}/edit`"
      >
        <Button>Edit!</Button>
      </RouterLink>
      <RouterLink :to="`/quizzes/${quiz.id}`">
        <Button>Start!</Button>
      </RouterLink>
    </div>
  </div>
</template>
