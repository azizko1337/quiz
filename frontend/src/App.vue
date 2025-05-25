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
  <div class="min-h-screen text-[#121212]">
    <Header />
    <div class="flex gap-10 justify-center items-center min-h-[82vh]">
      <main class="w-full max-w-7xl p-5">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>
