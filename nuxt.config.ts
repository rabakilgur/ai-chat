// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@comark/nuxt",
    "@nuxthub/core",
    "nuxt-auth-utils",
    "nuxt-charts",
    "nuxt-csurf",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  experimental: {
    viewTransition: true,
  },

  compatibilityDate: "2024-07-11",

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  hub: {
    db: "sqlite",
    blob: true,
  },

  vite: {
    optimizeDeps: {
      include: [
        "striptags", // CJS
        "motion-v",
        "@ai-sdk/vue",
        "ai",
        "@vueuse/core",
        "@shikijs/langs/c",
        "@shikijs/langs/cpp",
        "@shikijs/langs/css",
        "@shikijs/langs/diff",
        "@shikijs/langs/dockerfile",
        "@shikijs/langs/go",
        "@shikijs/langs/graphql",
        "@shikijs/langs/html",
        "@shikijs/langs/java",
        "@shikijs/langs/kotlin",
        "@shikijs/langs/php",
        "@shikijs/langs/python",
        "@shikijs/langs/ruby",
        "@shikijs/langs/rust",
        "@shikijs/langs/sql",
        "@shikijs/langs/swift",
        "@shikijs/langs/toml",
        "@shikijs/langs/xml",
      ],
    },
  },
});
