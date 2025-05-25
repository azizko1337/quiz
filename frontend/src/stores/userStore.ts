import { defineStore } from "pinia";
import { ref } from "vue";
import { userService, type User } from "@/services/userService";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      user.value = await userService.login(email, password);
      return user.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An error occurred during login";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    error.value = null;
    try {
      await userService.logout();
      user.value = null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An error occurred during logout";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadUser() {
    isLoading.value = true;
    error.value = null;
    try {
      user.value = await userService.getMe();
      if (!user.value) {
        await userService.logout();
      }
      return null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An error occurred loading user";
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  return { user, isLoading, error, login, logout, loadUser };
});
