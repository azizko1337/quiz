<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { SquareUser, LogIn } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { onBeforeMount } from "vue";

const router = useRouter();

onBeforeMount(() => {
  const userStore = useUserStore();
  if (userStore.user) {
    router.push("/quizzes");
  }
});
</script>

<template>
  <div
    class="flex items-center w-full max-w-2xl mx-auto justify-center max-md:flex-col-reverse max-md:gap-10"
  >
    <section class="p-8 w-full">
      <h1 class="text-3xl font-bold">Potrzebujesz utworzyć quiz?</h1>
      <h2 class="pl-4 mt-2 text-2xl">Nie ma sprawy</h2>

      <ul class="list-disc my-4 pl-5">
        <li><b>Prywatna</b> lub <b>publiczna</b> widoczność</li>
        <li>Zapisywanie <b>progresu</b></li>
        <li>Aplikacja <b>mobilna</b></li>
        <li>Pomoc przy tworzeniu pytań przez <b>Google Gemini</b></li>
        <li>Pomoc przy wytłumaczeniu odpowiedzi przez <b>Google Gemini</b></li>
        <li>Aplikacja jest w pełni <b>darmowa</b></li>
      </ul>

      <div class="flex max-md:flex-col gap-4 my-6">
        <Button
          class="border-1 rounded text-xl font-bold p-5 cursor-pointer"
          @click="router.push('/auth/login')"
          >ZALOGUJ SIĘ<LogIn :size="18"
        /></Button>
        <Button
          class="border-1 rounded text-xl font-bold p-5 cursor-pointer"
          @click="router.push('/auth/register')"
          >ZAŁÓŻ KONTO <SquareUser :size="18"
        /></Button>
      </div>
    </section>
  </div>
</template>
