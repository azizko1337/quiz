<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div
    class="flex items-center w-full max-w-lg mx-auto justify-center max-md:flex-col-reverse max-md:gap-10"
  >
    <section class="backdrop-brightness-50 backdrop-blur-sm p-8 rounded-lg">
      <h1 class="text-3xl font-bold">Potrzebujesz utworzyć quiz?</h1>
      <h2 class="pl-4 text-2xl">Nie ma sprawy</h2>

      <ul class="list-disc my-4 pl-5">
        <li><b>Prywatna</b> lub <b>publiczna</b> widoczność</li>
        <li>Zapisywanie <b>progresu</b></li>
        <li>Aplikacja <b>mobilna</b></li>
        <li>Pomoc przy tworzeniu pytań przez <b>Google Gemini</b></li>
        <li>Pomoc przy wytłumaczeniu odpowiedzi przez <b>Google Gemini</b></li>
        <li>Aplikacja jest w pełni <b>darmowa</b></li>
      </ul>

      <div class="flex">
        <Button
          class="border-1 rounded text-xl font-bold p-5 cursor-pointer my-6"
          to="/auth/register"
          >ZAŁÓŻ KONTO</Button
        >
      </div>
    </section>
  </div>
</template>
