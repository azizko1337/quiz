<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { RouterLink } from "vue-router";
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
  z
    .object({
      username: z
        .string({ required_error: "Pole jest wymagane*" })
        .min(3, "Musisz podać nazwę użytkownika")
        .max(64, "Nazwa jest za dluga"),
      email: z
        .string({ required_error: "Pole jest wymagane*" })
        .min(3, "Musisz podać email")
        .max(320, "Email jest za długi")
        .email("Niepoprawny email"),
      password: z
        .string({ required_error: "Pole jest wymagane*" })
        .min(8, "Hasło musi mieć co najmniej 8 znaków")
        .max(32, "Hasło nie może być dłuższe niż 32 znaki"),
      confirmPassword: z
        .string({ required_error: "Pole jest wymagane*" })
        .nonempty("Pole jest wymagane"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Hasła muszą być takie same",
      path: ["confirmPassword"],
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
    <h1 class="text-2xl font-bold">Rejestracja</h1>
    <form class="flex flex-col gap-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="username">
        <FormItem>
          <FormLabel>Nazwa użytkownika</FormLabel>
          <FormControl>
            <Input type="text" placeholder="" v-bind="componentField" />
          </FormControl>
          <FormDescription>Nazwa użytkownika jest publiczna</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="text" placeholder="" v-bind="componentField" />
          </FormControl>
          <FormDescription
            >Email jest prywatny i służy jako login</FormDescription
          >
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
      <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem>
          <FormLabel>Powtórz hasło</FormLabel>
          <FormControl>
            <Input type="password" placeholder="" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button class="cursor-pointer shadow-2xl my-4" type="submit">
        Zarejestruj się
      </Button>
    </form>
    <p>
      Rejestrując się akceptujesz
      <RouterLink class="text-blue-400" to="/policy"
        >regulamin i politykę prywatności</RouterLink
      >.
    </p>
    <RouterLink class="text-blue-400" to="/auth/login"
      >Masz już konto? Zaloguj się</RouterLink
    >
  </section>
</template>
