<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type ButtonVariants, buttonVariants } from ".";
import FlameImage from "@/assets/images/flame.gif";
import { ref } from "vue";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});

const hover = ref(false);
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        props.class,
        'cursor-pointer',
        'relative'
      )
    "
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <img
      v-if="hover"
      class="absolute w-full bottom-0 left-0"
      :src="FlameImage"
    />
    <slot />
  </Primitive>
</template>
