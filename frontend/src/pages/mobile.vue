<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Download } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();
</script>
<template>
  <div
    class="flex items-center w-full max-w-2xl mx-auto justify-center max-md:flex-col-reverse max-md:gap-10 gap-4"
  >
    <section class="p-8 w-full">
      <h1 class="text-3xl font-bold">
        Aplikacja posiada również wersję mobilną <br />dla systemu Android
      </h1>
      <ul class="list-disc my-4">
        <li>Bezpieczna (logowanie <b>odciskiem palca)</b></li>
        <li>Nie wysyła zbędnych powiadomień</li>
        <li>Prosta i lekka, pozwala na rozwiązywanie quizów</li>
      </ul>
      <div class="flex">
        <Button
          class="border-1 rounded text-xl font-bold p-5 cursor-pointer my-6"
          @click="router"
          >POBIERZ .APK <Download :size="18"
        /></Button>
      </div>
    </section>
    <section>
      <img class="max-w-[90%]" :src="MobileImage" />
    </section>
  </div>
</template>
