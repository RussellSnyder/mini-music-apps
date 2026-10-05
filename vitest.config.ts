import { defineConfig } from "vitest/config";

const mainFields = ["module", "main"];

export default defineConfig({
  // Newer @tonaljs packages ship .mjs/.cjs but declare a missing dist/index.js
  // as "main", so resolve them through the "module" field.
  resolve: { mainFields },
  environments: { ssr: { resolve: { mainFields } } },
  ssr: { noExternal: [/@tonaljs\//, "tonal"] },
});
