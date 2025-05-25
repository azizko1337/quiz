<script setup lang="ts">
import { ref } from "vue";
import { useAttemptStore } from "@/stores/attemptStore";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const attemptStore = useAttemptStore();
</script>
<template>
  <div
    class="fixed bottom-0 left-[50%] translate-x-[-50%] px-10 flex justify-center p-4"
  >
    <Drawer>
      <DrawerTrigger>
        <h3
          class="mb-2 rounded-full w-[55px] aspect-[1] cursor-pointer bg-blue-400 text-white flex items-center justify-center"
        >
          {{ attemptStore.score ?? 0 }}%
        </h3>
      </DrawerTrigger>
      <DrawerContent class="mx-auto w-80 bg-white p-6">
        <DrawerHeader>
          <DrawerTitle class="text-center">Podsumowanie podejścia</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <ul>
            <li>
              <b>Wynik:</b> {{ attemptStore?.attempt?.score ?? 0 }} /
              {{ attemptStore?.questions?.length ?? 0 }} ({{
                attemptStore.score
              }}%)
            </li>
            <li>
              <b>Utworzenie podejścia:</b>
              {{
                attemptStore.attempt.createdAt
                  ? new Date(attemptStore.attempt.createdAt).toLocaleString()
                  : "Brak danych"
              }}
            </li>
            <li>
              <b>Czas obecnej sesji:</b>
              {{ Math.floor(attemptStore.sessionTime / 60) }} minut
              {{ attemptStore.sessionTime % 60 }} sekund
            </li>
          </ul>

          <div class="h-[50px]"></div>
          <DrawerClose>
            <Button variant="outline"> Zamknij </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>
