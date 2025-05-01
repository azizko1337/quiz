<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, Ellipsis } from "lucide-vue-next";
import { ref } from "vue";

const isMoreOptionsOpened = ref(false);
</script>
<template>
  <form
    class="bg-gradient-to-r from-gray-900 to-zinc-900 flex flex-col gap-8 justify-between w-full max-w-[1000px] rounded-lg px-4 py-3 shadow-2xl border-y-2"
  >
    <div class="flex gap-4 items-center">
      <span
        class="border-1 rounded-full w-8 h-8 flex justify-center items-center font-sans text-sm"
        >9</span
      >
      <h2 class="grow">
        Bardzo zaawansowane testowe pytanie dolor sit amet 122342 sad asd asd
        as?
      </h2>
      <Button
        @click.prevent="isMoreOptionsOpened = !isMoreOptionsOpened"
        class="relative"
      >
        <Ellipsis size="24" />

        <div
          v-if="isMoreOptionsOpened"
          @click.stop.prevent
          class="absolute top-[100%] right-[100%] w-[200px] bg-red-500"
        >
          sadasd
        </div>
      </Button>
    </div>

    <div class="w-full max-w-[500px]">
      <img
        class="w-full"
        src="https://media0.giphy.com/media/A0lTlnxCyVogONSvum/200w.gif?cid=6c09b952ngalwr2ounh5pyp9at8dx8e39r5m5ti8tljqeve0&ep=v1_gifs_search&rid=200w.gif&ct=g"
      />
    </div>

    <ul class="flex flex-col gap-4">
      <li v-for="i in [1, 2, 3, 4, 5]" class="items-top flex gap-x-2">
        <Checkbox id="terms1" />
        <div class="grid gap-1.5 leading-none">
          <label
            for="terms1"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Treść odpowiedzi bla bal bla
          </label>
        </div>
      </li>
    </ul>
    <div class="flex justify-end gap-4">
      <Button @click.prevent @dblclick="console.log(1)" class="border-1"
        >Sprawdź odpowiedzi</Button
      >
      <Button class="border-1">
        <Check size="24" />
      </Button>
    </div>
  </form>
</template>
