import path from "path";
import { defineConfig } from "vitest/config";

// Isolated test config: deliberately does NOT extend vite.config.ts, so unit
// tests run in plain node with no Vite plugins involved.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
