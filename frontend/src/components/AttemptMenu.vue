<script setup lang="ts">
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
    class="fixed bottom-0 left-[50%] translate-x-[-50%] px-10 flex justify-center bg-black p-4"
  >
    <h3>
      Twój wynik:
      <span class="text-xl">{{ attemptStore.attempt?.score ?? 0 }}</span>
    </h3>
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent class="mx-auto w-80 bg-white p-6">
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter
          >asdadsasasdads
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline"> Cancel </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>
