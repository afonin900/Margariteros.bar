import { defineConfig } from "vitest/config";

// The upstream API suite bootstraps its database mock before every test. The
// Syrve adapter is deliberately dependency-free, so this focused gate stays
// runnable from a clean RefRef checkout where workspace dist exports are absent.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/unit/syrve-native.test.ts"],
  },
});
