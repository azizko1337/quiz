<script setup lang="ts">
import "@/style.css";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Tribal from "@/assets/images/tribal.webp";
import { useUserStore } from "@/stores/userStore";
import { onMounted } from "vue";

const userStore = useUserStore();

onMounted(async () => {
  await userStore.loadUser();
});
</script>

<template>
  <Header />
  <div class="flex gap-10 justify-center items-center min-h-[70vh]">
    <div>
      <img class="" width="100" :src="Tribal" alt="tribal" />
      <img class="" width="100" :src="Tribal" alt="tribal" />
    </div>
    <main class="w-full max-w-7xl">
      <router-view />
    </main>
    <div>
      <img class="rotate-180" width="100" :src="Tribal" alt="tribal" />
      <img class="rotate-180" width="100" :src="Tribal" alt="tribal" />
    </div>
  </div>
  <Footer />
</template>
