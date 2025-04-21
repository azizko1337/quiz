<script setup lang="ts">
import "@/style.css";
import Header from "@/components/Header/Header.vue";
import Footer from "@/components/Footer.vue";
import Tribal from "@/assets/images/tribal.webp";
import { useUserStore } from "@/stores/userStore";
import { onMounted } from "vue";
import { Toaster } from "@/components/ui/sonner";

const userStore = useUserStore();

onMounted(async () => {
  await userStore.loadUser();
});
</script>

<template>
  <Toaster />
  <div
    class="bg-[#121212] bg-cover bg-no-repeat bg-center min-h-screen backdrop-blur-sm text-amber-50"
  >
    <Header />
    <div class="flex gap-10 justify-center items-center min-h-[82vh]">
      <div class="max-md:hidden">
        <img class="" width="100" :src="Tribal" alt="tribal" />
        <img class="" width="100" :src="Tribal" alt="tribal" />
      </div>
      <main class="w-full max-w-7xl p-5">
        <router-view />
      </main>
      <div class="max-md:hidden">
        <img class="rotate-180" width="100" :src="Tribal" alt="tribal" />
        <img class="rotate-180" width="100" :src="Tribal" alt="tribal" />
      </div>
    </div>
    <Footer />
  </div>
</template>
