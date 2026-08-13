import path from "path";
import { defineConfig } from "vitest/config";

// Isolated test config: deliberately does NOT extend vite.config.ts (which
// loads the platform's vlyPlugin), so unit tests run in plain node.
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
