<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useRouter } from "vue-router";
import * as z from "zod";
import { ref } from "vue";
import { Plus, WandSparkles } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
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
import { aiService } from "@/services/aiService"; // Import AI service
import { useUserStore } from "@/stores/userStore";
import { Slider } from "@/components/ui/slider";

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
      .max(500, "Tytuł jest za długi"),
    description: z
      .string()
      .max(100, "Opis nie może być dłuższy niż 100 znaków")
      .optional(),
    additionalInfo: z
      .string()
      .max(100, "Podpowiedzi nie mogą być dłuższe niż 100 znaków")
      .optional(),
    numberOfQuestions: z
      .array(
        z
          .number()
          .min(1, "Quiz musi zawierać co najmniej 1 pytanie")
          .max(10, "Quiz nie może mieć więcej niż 10 pytań")
      )
      .default([5]),
    isPublic: z.boolean().default(true), // Add isPublic field, default to true
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    isPublic: true,
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  if (!userStore.user) {
    createError.value = "Musisz być zalogowany, aby utworzyć quiz";
    return;
  }

  try {
    isSubmitting.value = true;
    createError.value = null;

    const quiz = await aiService.generateQuiz(
      values.title,
      values.description || "",
      values.isPublic,
      values.numberOfQuestions[0], // Use the first value from the array,
      values.additionalInfo || ""
    );

    // Redirect to the newly created quiz edit page
    router.push(`/quizzes/${quiz.id}/edit`); // Redirect to edit page instead of list
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
  <section
    class="flex flex-col gap-10 items-center justify-center p-5 w-full max-w-[600px] mx-auto rounded-lg"
  >
    <h1 class="text-2xl font-bold">
      Utwórz nowy quiz <b class="animate-pulse text-amber-500">AI</b>
    </h1>
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
      <FormField v-slot="{ componentField }" name="additionalInfo">
        <FormItem>
          <FormLabel>Opis (opcjonalny)</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Wpisz dodatkowe informacje dla AI"
              v-bind="componentField"
            />
          </FormControl>
          <FormDescription
            >Dodatkowe informacje dla
            <b class="text-amber-500 animate-pulse">AI</b></FormDescription
          >
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, value }" name="numberOfQuestions">
        <FormItem>
          <FormLabel>Liczba pytań</FormLabel>
          <FormControl>
            <Slider
              class="bg-gray-400"
              :model-value="componentField.modelValue"
              :default-value="[5]"
              :min="1"
              :max="10"
              :step="1"
              :name="componentField.name"
              @update:model-value="componentField['onUpdate:modelValue']"
            />
          </FormControl>
          <FormDescription class="flex justify-between">
            <span>Ilość pytań:</span>
            <span>{{ value?.[0] ?? 5 }}</span>
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Checkbox for Public/Private with boolean values -->
      <FormField v-slot="{ value, handleChange }" name="isPublic">
        <FormItem
          class="flex flex-row items-start gap-x-3 space-y-0 rounded-md border p-4"
        >
          <FormControl>
            <Checkbox
              :model-value="value"
              @update:model-value="handleChange"
              type="checkbox"
            />
          </FormControl>
          <div class="space-y-1 leading-none">
            <FormLabel>Publiczny</FormLabel>
          </div>
        </FormItem>
        <FormMessage />
      </FormField>

      <div class="flex items-center my-4">
        <Button
          class="border-1 mx-auto flex space-between"
          type="submit"
          :disabled="isSubmitting"
        >
          <WandSparkles class="mr-2" :size="16" />
          <div class="grow"></div>
          <span> {{ isSubmitting ? "Tworzenie..." : "Wygeneruj quiz" }}</span>
          <div class="grow"></div>
          <WandSparkles class="mr-2" :size="16" />
        </Button>
      </div>
    </form>
  </section>
</template>
