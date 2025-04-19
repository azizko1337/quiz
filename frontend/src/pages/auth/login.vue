<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useRouter } from "vue-router";
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
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();
const loginError = ref<string | null>(null);

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: "Pole jest wymagane*" })
      .min(3, "Musisz podać email")
      .max(320, "Email jest za długi")
      .email("Niepoprawny email"),
    password: z
      .string({ required_error: "Pole jest wymagane*" })
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .max(32, "Hasło nie może być dłuższe niż 32 znaki"),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loginError.value = null;
    await userStore.login(values.email, values.password);
    // Redirect after login
    router.push("/");
  } catch (error) {
    loginError.value =
      error instanceof Error ? error.message : "Nieprawidłowe dane logowania";
    console.error(error);
  }
});
</script>

<template>
  <section
    class="flex flex-col w-full max-w-lg mx-auto items-center backdrop-brightness-50 backdrop-blur-sm p-8 rounded-lg"
  >
    <h1 class="text-2xl font-bold mb-8">Logowanie</h1>
    <form class="flex flex-col gap-4" @submit="onSubmit">
      <div v-if="loginError" class="text-destructive mb-4">
        {{ loginError }}
      </div>
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="text" placeholder="" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>Hasło</FormLabel>
          <FormControl>
            <Input type="password" placeholder="" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button
        class="my-4 border-1"
        type="submit"
        :disabled="userStore.isLoading"
      >
        {{ userStore.isLoading ? "Logowanie..." : "Zaloguj się" }}
      </Button>
    </form>
    <RouterLink class="text-blue-400" to="/auth/register"
      >Nie masz konta? Zarejestruj się</RouterLink
    >
  </section>
</template>
