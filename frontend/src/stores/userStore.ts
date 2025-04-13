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
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) return null;

    isLoading.value = true;
    error.value = null;
    try {
      // This is a simplified implementation
      // In a real app, you might want to make an API call to validate the token
      const userFromToken = parseJwt(token);
      if (userFromToken && userFromToken.id) {
        user.value = userFromToken;
        return user.value;
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

  // Helper function to parse JWT token
  function parseJwt(token: string) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  return { user, isLoading, error, login, logout, loadUser };
});
