export default defineNuxtPlugin((nuxtApp) => {
  // Access the Vue Router instance via the Nuxt app
  const router = nuxtApp.$router

  router.onError((error, to, from) => {
    console.error('Global router error intercepted:', error)
    console.log(`Failed navigating from ${from.fullPath} to ${to.fullPath}`)
  })
})
