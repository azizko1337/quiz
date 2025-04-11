<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

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

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
});
</script>

<template>
  <section class="flex flex-col gap-10 items-center justify-center">
    <h1 class="text-2xl font-bold">Logowania</h1>
    <form class="flex flex-col gap-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="text" placeholder="" v-bind="componentField" />
          </FormControl>
          <!-- <FormDescription> This is your public display name. </FormDescription> -->
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>Hasło</FormLabel>
          <FormControl>
            <Input type="text" placeholder="" v-bind="componentField" />
          </FormControl>
          <!-- <FormDescription> This is your public display name. </FormDescription> -->
          <FormMessage />
        </FormItem>
      </FormField>
      <Button class="cursor-pointer shadow-2xl my-4" type="submit">
        Zaloguj się
      </Button>
    </form>
    <RouterLink class="text-blue-400" to="/auth/register"
      >Nie masz konta? Zarejestruj się</RouterLink
    >
  </section>
</template>
