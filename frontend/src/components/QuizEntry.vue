<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
</script>
<template>
  <div class="flex justify-between w-full">
    <div class="flex flex-col">
      <h2 class="text-lg font-bold">adsasdas</h2>
      <p class="text-md text-gray-500">asd</p>
      <div class="grow p-1"></div>
      <p class="text-sm text-accent">
        Created by <Badge>jankowalski36</Badge>, <Badge>12.02.2202</Badge>
      </p>
    </div>
    <div class="flex flex-col justify-end">
      <Button> Start! </Button>
    </div>
  </div>
</template>
