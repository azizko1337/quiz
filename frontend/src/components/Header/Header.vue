<script setup lang="ts">
import { RouterLink } from "vue-router";
import Logo from "@/assets/images/logo.png";
import { useUserStore } from "@/stores/userStore";
import HeaderButton from "@/components/Header/HeaderButton.vue";
import { Menu, X } from "lucide-vue-next";
import { ref } from "vue";

const userStore = useUserStore();

const links = [
  { name: "Strona główna", path: "/" },
  { name: "Aplikacja mobilna", path: "/mobile" },
];

async function handleLogout() {
  await userStore.logout();
}

const isHeaderOpen = ref(false);
</script>
<template>
  <button
    class="absolute top-2 right-2 cursor-pointer p-2 z-15 md:hidden"
    @click="isHeaderOpen = !isHeaderOpen"
  >
    <Menu v-if="!isHeaderOpen" :size="36" />
    <X v-else :size="36" />
  </button>

  <!-- Desktop Header (always visible) -->
  <header class="w-full hidden md:flex justify-between items-center py-2 pr-10">
    <RouterLink to="/">
      <div class="flex items-center gap-1">
        <img class="w-[80px] cursor-pointer" :src="Logo" alt="Logo" />
      </div>
    </RouterLink>
    <nav>
      <ul class="flex gap-2 items-center">
        <li v-for="link in links">
          <HeaderButton :link="link" />
        </li>
        <!-- Auth Links -->
        <template v-if="userStore.user">
          <li>
            <HeaderButton :link="{ name: 'Moje quizy', path: '/quizzes' }" />
          </li>
          <li>
            <HeaderButton
              :link="{ name: 'Moje podejścia', path: '/attempts' }"
            />
          </li>
          <li class="ml-4 italic">
            <HeaderButton
              :link="{ name: userStore.user.username, path: '/users' }"
            />
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

  <!-- Mobile Header (animated) -->
  <transition name="slide-down">
    <header
      v-if="isHeaderOpen"
      class="w-full flex flex-col justify-between items-center py-10 absolute z-10 backdrop-brightness-50 backdrop-blur-2xl md:hidden"
    >
      <RouterLink to="/" @click="isHeaderOpen = false">
        <div class="flex items-center gap-1 mb-6">
          <img class="w-[80px] cursor-pointer" :src="Logo" alt="Logo" />
        </div>
      </RouterLink>
      <nav>
        <ul class="flex flex-col gap-4 items-center">
          <li v-for="link in links">
            <HeaderButton :link="link" @click="isHeaderOpen = false" />
          </li>
          <!-- Auth Links -->
          <template v-if="userStore.user">
            <li>
              <HeaderButton
                :link="{ name: 'Moje quizy', path: '/quizzes' }"
                @click="isHeaderOpen = false"
              />
            </li>
            <li>
              <HeaderButton
                :link="{ name: 'Moje podejścia', path: '/attempts' }"
                @click="isHeaderOpen = false"
              />
            </li>
            <li class="mt-4 italic">
              <HeaderButton
                :link="{ name: userStore.user.username, path: '/users' }"
                @click="isHeaderOpen = false"
              />
            </li>
          </template>
          <template v-else>
            <li class="mt-4">
              <RouterLink
                class="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                to="/auth/login"
                @click="isHeaderOpen = false"
              >
                Zaloguj
              </RouterLink>
            </li>
            <li>
              <RouterLink
                class="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                to="/auth/register"
                @click="isHeaderOpen = false"
              >
                Zarejestruj
              </RouterLink>
            </li>
          </template>
        </ul>
      </nav>
    </header>
  </transition>

  <div class="h-[50px] hidden max-md:flex"></div>
</template>

<style scoped>
/* Slide down animation for mobile header */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
}
</style>
