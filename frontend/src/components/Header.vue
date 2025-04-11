<script setup lang="ts">
import { RouterLInk } from "vue-router";
import Logo from "@/assets/images/logo.jpg";

const links = [
  { name: "Strona główna", path: "/" },
  { name: "Aplikacja mobilna", path: "/about" },
];
</script>
<template>
  <header class="w-full flex justify-between items-center py-2 pr-10">
    <div class="flex items-center gap-1">
      <img class="w-[200px]" :src="Logo" alt="Logo" />
      <h1 class="text-2xl font-bold">QUIZ-UŚ</h1>
    </div>
    <nav>
      <ul class="flex gap-2">
        <li v-for="link in links">
          <RouterLink class="p-2" :to="link.path">{{ link.name }}</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
