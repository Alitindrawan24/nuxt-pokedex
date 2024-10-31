// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },

  modules: [
      '@nuxtjs/tailwindcss',
      "nuxt-lodash",
      '@nuxt/image',
      "@nuxt/icon"
  ],

  compatibilityDate: '2024-10-23',
})
