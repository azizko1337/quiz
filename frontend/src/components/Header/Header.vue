<script setup lang="ts">
import { RouterLink } from "vue-router";
import Logo from "@/assets/images/logo.png";
import { useUserStore } from "@/stores/userStore";
import HeaderButton from "@/components/Header/HeaderButton.vue";

const userStore = useUserStore();

const links = [
  { name: "Strona główna", path: "/" },
  { name: "Aplikacja mobilna", path: "/mobile" },
];

async function handleLogout() {
  await userStore.logout();
}
</script>
<template>
  <header class="w-full flex justify-between items-center py-2 pr-10">
    <div class="flex items-center gap-1">
      <img class="w-[80px] cursor-pointer" :src="Logo" alt="Logo" />
    </div>
    <nav>
      <ul class="flex gap-2 items-center">
        <li v-for="link in links">
          <HeaderButton :link="link" />
        </li>
        <!-- Auth Links -->
        <template v-if="userStore.user">
          <li>
            <RouterLink class="p-2" to="/quizzes">Moje quizy</RouterLink>
          </li>
          <li>
            <RouterLink class="p-2" to="/attempts">Moje podejścia</RouterLink>
          </li>
          <li>
            <RouterLink class="p-2" to="/quizzes/create"
              >Stwórz quiz</RouterLink
            >
          </li>
          <li class="flex items-center gap-2 ml-4">
            <span>{{ userStore.user.username }}</span>
            <button
              @click="handleLogout"
              class="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            >
              Wyloguj
            </button>
          </li>
        </template>
        <template v-else>
          <li class="ml-4">
            <RouterLink
              class="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              to="/auth/login"
            >
              Zaloguj
            </RouterLink>
          </li>
          <li>
            <RouterLink
              class="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
              to="/auth/register"
            >
              Zarejestruj
            </RouterLink>
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>
