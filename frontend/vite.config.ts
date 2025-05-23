import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Pages from "vite-plugin-pages";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8085,
    allowedHosts: ["localhost", "quiz.azalupka.cc"],
  },
  preview: {
    port: 8085,
    allowedHosts: ["localhost", "quiz.azalupka.cc"],
  },
  plugins: [
    vue(),
    tailwindcss(),
    Pages({
      dirs: "src/pages",
      extensions: ["vue"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
