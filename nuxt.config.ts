// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    meta: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width" },
      {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
        "http-equiv": "Content-Security-Policy",
        content: "default-src 'self'; connect-src *; script-src 'unsafe-eval'; script-src-elem 'self' https://apis.google.com https://cdn.jsdelivr.net https://cors-proxy.opencor.workers.dev; worker-src 'self'; style-src 'self' 'unsafe-inline'; frame-src 'self' https://opencorapp.firebaseapp.com; img-src 'self' blob: data:"
      }
    ],
    title: "OpenCOR",
    // Nuxt docs: please note that this is an area that is likely to change
    style: [
      {
        // this is from <style scoped> but Nuxt 4 doesn'y apply scoped styles directly
        // from inside the global app.head configuration...
        textContent: `
          body {
            background-color: #ffffff; /* Light version of --p-content-background. *  /
            color: #334155; /* Light version of --p-content-color. *  /
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #18181b; /* Dark version of --p-content-background. *  /
              color: #ffffff; /* Dark version of --p-content-color. *  /
            }
          }
        `
      },
    ],
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
