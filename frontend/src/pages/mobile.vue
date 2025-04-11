<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
</script>
<template>
  <section>
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
        @click=""
        >POBIERZ .APK</Button
      >
    </div>
  </section>
</template>
