<script setup lang="ts">
import { RouterLInk } from "vue-router";
import Flame from "@/assets/images/flame.gif";
</script>
<template>
  <footer class="w-full">
    <div class="flex justify-between">
      <img class="w-1/4" :src="Flame" alt="flame" />
      <img class="w-1/4" :src="Flame" alt="flame" />
      <img class="w-1/4" :src="Flame" alt="flame" />
    </div>
    <div class="p-5 flex flex-col items-end justify-end">
      Aplikacja wykonana na projekt zaliczeniowy modułu Projektowanie Webowych
      Aplikacji Graficznych przez:
      <a
        class="text-blue-800 font-bold"
        href="https://azalupka.cc"
        target="_blank"
        >Antoniego Załupkę</a
      >
    </div>
  </footer>
</template>
