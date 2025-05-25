<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from "vue";
import LavaImage from "@/assets/images/lava.gif";

const props = defineProps({
  link: {
    type: Object,
    required: true,
  },
});

const hover = ref(false);
const lavaHeight = ref(10);
let intervalId: number | undefined;

onMounted(() => {
  intervalId = setInterval(() => {
    lavaHeight.value += 50;
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

watch(hover, (newValue) => {
  lavaHeight.value = 10;
});
</script>
<template>
  <RouterLink
    @mouseover="hover = true"
    @mouseleave="hover = false"
    class="p-2 relative hover:border-b-14 border-blue-400 transition-colors"
    :to="link.path"
    >{{ link.name }}
    <!-- <img
      v-if="hover"
      class="absolute w-full left-0 top-[80%] z-10 max-h-[800px]"
      :style="{ height: `${lavaHeight}px` }"
      :src="LavaImage"
    /> -->
  </RouterLink>
</template>
