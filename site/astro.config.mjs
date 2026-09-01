import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

export default defineConfig({
  output: "server",
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "en", "ru", "es"],
    fallback: { en: "pl", ru: "pl", es: "pl" },
    routing: { prefixDefaultLocale: true },
  },
  adapter: node({ mode: "standalone" }),
  integrations: [
    react(),
    emdash({
      database: sqlite({ url: "file:./data/emdash.db" }),
      storage: local({
        directory: "./data/uploads",
        baseUrl: "/_emdash/api/media/file",
      }),
      maxUploadSize: 250 * 1024 * 1024,
    }),
  ],
});
