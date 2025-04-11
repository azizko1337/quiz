<script setup lang="ts">
import { RouterLInk } from "vue-router";
import Flame from "@/assets/images/flame.gif";
</script>
<template>
  <footer class="w-full">
    <div class="p-5 flex justify-center">
      <i
        >Aplikacja wykonana na projekt zaliczeniowy modułu
        <b>Projektowanie Webowych Aplikacji Graficznych</b> przez:
        <a
          class="text-blue-400 font-bold"
          href="https://azalupka.cc"
          target="_blank"
          >Antoniego Załupkę</a
        ></i
      >
    </div>
    <div class="flex justify-between">
      <img class="w-1/4" :src="Flame" alt="flame" />
      <img class="w-1/4" :src="Flame" alt="flame" />
      <img class="w-1/4" :src="Flame" alt="flame" />
    </div>
  </footer>
</template>
