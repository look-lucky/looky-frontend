// orval.config.ts
import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "./openapi.json",
    },
    output: {
      target: "./src/api/generated.ts",
      client: "react-query",
      mode: "tags",
      override: {
        mutator: {
          path: "./src/api/mutator.ts",
          name: "customFetch",
        },
      },
    },
  },
});
