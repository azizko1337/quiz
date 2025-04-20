<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useRouter } from "vue-router";
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
import { useUserStore } from "@/stores/userStore";
import { userService } from "@/services/userService";

const router = useRouter();
const userStore = useUserStore();
const editError = ref<string | null>(null);
const deleteError = ref<string | null>(null);
const isSubmitting = ref(false);
const isDeleting = ref(false);

// Redirect if not logged in
onMounted(() => {
  if (!userStore.user) {
    router.push("/auth/login");
  } else {
    // Initialize form with current user data
    form.setValues({
      username: userStore.user.username,
      email: userStore.user.email,
    });
  }
});

const formSchema = toTypedSchema(
  z
    .object({
      username: z
        .string({ required_error: "Pole jest wymagane*" })
        .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki")
        .max(64, "Nazwa użytkownika jest za długa"),
      email: z
        .string({ required_error: "Pole jest wymagane*" })
        .min(3, "Musisz podać email")
        .max(320, "Email jest za długi")
        .email("Niepoprawny email"),
      password: z
        .string()
        .min(8, "Hasło musi mieć co najmniej 8 znaków")
        .max(32, "Hasło nie może być dłuższe niż 32 znaki")
        .optional()
        .or(z.literal("")), // Allow empty string
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        // If password is provided, confirmPassword must match
        if (data.password && data.password.length > 0) {
          return data.password === data.confirmPassword;
        }
        return true; // No password provided, validation passes
      },
      {
        message: "Hasła muszą być takie same",
        path: ["confirmPassword"],
      }
    )
    .refine(
      (data) => {
        // If password is provided, confirmPassword is required
        if (data.password && data.password.length > 0) {
          return data.confirmPassword && data.confirmPassword.length > 0;
        }
        return true; // No password provided, validation passes
      },
      {
        message: "Potwierdzenie hasła jest wymagane",
        path: ["confirmPassword"],
      }
    )
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  if (!userStore.user) return;

  try {
    isSubmitting.value = true;
    editError.value = null;

    const updateData: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    if (values.username !== userStore.user.username) {
      updateData.username = values.username;
    }
    if (values.email !== userStore.user.email) {
      updateData.email = values.email;
    }
    if (values.password && values.password.length > 0) {
      updateData.password = values.password;
    }

    if (Object.keys(updateData).length > 0) {
      const updatedUser = await userService.updateUser(
        userStore.user.id,
        updateData.username,
        updateData.email,
        updateData.password
      );
      // Optionally update user data in the store if needed
      // userStore.user = { ...userStore.user, ...updatedUser };
      alert("Profil zaktualizowany!");
      // Reset password fields after successful update
      form.resetField("password");
      form.resetField("confirmPassword");
    } else {
      alert("Nie wprowadzono żadnych zmian.");
    }
  } catch (error) {
    editError.value =
      error instanceof Error
        ? error.message
        : "Błąd podczas aktualizacji profilu";
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
});

async function handleLogout() {
  try {
    await userStore.logout();
    router.push("/");
  } catch (error) {
    console.error("Logout failed:", error);
    // Optionally show an error message to the user
  }
}

async function handleDeleteAccount() {
  if (!userStore.user) return;

  const confirmation = confirm(
    "Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć."
  );
  if (!confirmation) return;

  try {
    isDeleting.value = true;
    deleteError.value = null;
    await userService.deleteUser(userStore.user.id);
    await userStore.logout(); // Logout after successful deletion
    alert("Konto zostało usunięte.");
    router.push("/");
  } catch (error) {
    deleteError.value =
      error instanceof Error ? error.message : "Błąd podczas usuwania konta";
    console.error(error);
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <section
    v-if="userStore.user"
    class="flex flex-col w-full max-w-2xl mx-auto gap-10 items-center backdrop-brightness-50 backdrop-blur-sm p-8 rounded-lg"
  >
    <h1 class="text-2xl font-bold">Twój profil</h1>

    <!-- Edit Profile Form -->
    <form class="flex flex-col gap-4 w-full" @submit="onSubmit">
      <h2 class="text-xl font-semibold mb-2">Edytuj dane</h2>
      <div v-if="editError" class="text-destructive mb-4">
        {{ editError }}
      </div>

      <FormField v-slot="{ componentField }" name="username">
        <FormItem>
          <FormLabel>Nazwa użytkownika</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormDescription>Nazwa użytkownika jest publiczna</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormDescription
            >Email jest prywatny i służy jako login</FormDescription
          >
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>Nowe hasło (opcjonalnie)</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Zostaw puste aby nie zmieniać"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem>
          <FormLabel>Potwierdź nowe hasło</FormLabel>
          <FormControl>
            <Input type="password" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button
        class="cursor-pointer shadow-2xl my-4 border-1"
        type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Zapisywanie..." : "Zapisz zmiany" }}
      </Button>
    </form>

    <!-- Actions -->
    <div class="w-full border-t border-border pt-6 mt-6 flex flex-col gap-4">
      <h2 class="text-xl font-semibold mb-2">Akcje</h2>
      <Button
        variant="outline"
        @click="handleLogout"
        :disabled="userStore.isLoading"
      >
        Wyloguj się
      </Button>

      <div v-if="deleteError" class="text-destructive mt-4">
        {{ deleteError }}
      </div>
      <Button
        variant="destructive"
        @click="handleDeleteAccount"
        :disabled="isDeleting"
      >
        {{ isDeleting ? "Usuwanie..." : "Usuń konto" }}
      </Button>
      <p class="text-sm text-muted-foreground">
        Usunięcie konta jest nieodwracalne.
      </p>
    </div>
  </section>
  <div v-else class="text-center">
    <p>Ładowanie danych użytkownika...</p>
  </div>
</template>
