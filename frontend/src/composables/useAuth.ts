import { ref } from "vue";
import type { Ref } from "vue";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  // Add any other user properties that might be in your token
}

export function useAuth() {
  const user: Ref<User | null> = ref(null);
  const isAuthenticated = ref(false);

  // Function to get cookie by name
  function getCookie(name: string): string | null {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split("=");
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  // Function to decode JWT token
  function decodeToken(token: string): User | null {
    try {
      // JWT token has 3 parts: header.payload.signature
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      // Decode the payload (second part)
      const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(payload) as User;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  // Load and decode the auth token
  function loadUser() {
    const token = getCookie("auth-token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        user.value = decoded;
        isAuthenticated.value = true;
        return true;
      }
    }
    user.value = null;
    isAuthenticated.value = false;
    return false;
  }

  // Initialize on composable creation
  loadUser();

  return {
    user,
    isAuthenticated,
    loadUser,
  };
}
