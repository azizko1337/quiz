<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useRouter } from "vue-router";
import * as z from "zod";
import { ref } from "vue";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { quizService } from "@/services/quizService";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();
const createError = ref<string | null>(null);
const isSubmitting = ref(false);

// Redirect if user is not logged in
if (!userStore.user) {
  router.push("/auth/login");
}

const formSchema = toTypedSchema(
  z.object({
    title: z
      .string({ required_error: "Pole jest wymagane*" })
      .min(3, "Tytuł musi mieć co najmniej 3 znaki")
      .max(100, "Tytuł jest za długi"),
    description: z
      .string()
      .max(500, "Opis nie może być dłuższy niż 500 znaków")
      .optional(),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  if (!userStore.user) {
    createError.value = "Musisz być zalogowany, aby utworzyć quiz";
    return;
  }

  try {
    isSubmitting.value = true;
    createError.value = null;

    console.log(userStore.user);
    const quiz = await quizService.createQuiz(
      userStore.user.id,
      values.title,
      values.description
    );

    // Redirect to quiz edit page or quiz list
    router.push(`/quizzes`);
  } catch (error) {
    createError.value =
      error instanceof Error ? error.message : "Błąd podczas tworzenia quizu";
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <section class="flex flex-col gap-10 items-center justify-center">
    <h1 class="text-2xl font-bold">Utwórz nowy quiz</h1>
    <form class="flex flex-col gap-4 w-full max-w-md" @submit="onSubmit">
      <div v-if="createError" class="text-destructive mb-4">
        {{ createError }}
      </div>

      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel>Tytuł quizu</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Wpisz tytuł quizu"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription
            >Tytuł powinien jasno określać temat quizu</FormDescription
          >
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel>Opis (opcjonalny)</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Wpisz krótki opis quizu"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription>Krótki opis czego dotyczy quiz</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button
        class="cursor-pointer shadow-2xl my-4"
        type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Tworzenie..." : "Utwórz quiz" }}
      </Button>
    </form>
  </section>
</template>
