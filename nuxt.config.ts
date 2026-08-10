import * as primeVueAutoImportResolver from '@primevue/auto-import-resolver';
import tailwindcssPlugin from '@tailwindcss/vite';

import * as nodeFs from 'node:fs';
import { visualizer as visualizerPlugin } from 'rollup-plugin-visualizer';
import vitePlugin from 'unplugin-vue-components/vite';

import { libopencorInstallPath } from './scripts/libopencor.install';
import { libopencorVersion } from './scripts/libopencor.version';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/',
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

  components: [
    {
      path: '~/components',
      pathPrefix: false, // Disables folder name prefixing
    }
  ],

  devtools: { enabled: true },

  experimental: {
    // This allows the compiler to properly handle TypeScript types in SFCs
    typedPages: true
  },

  future: {
    compatibilityVersion: 4, // Ensures strict Nuxt 4 directory conventions
  },

  nitro: {
    experimental: {
      websocket: true
    },
    preset: 'bun'
  },

  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    }
  },

  sourcemap: {
    server: true,
    client: true,
  },

  telemetry: false,

  vite: {
    define: {
      __LIBOPENCOR_WASM_BASE_URL__: JSON.stringify(`/${libopencorInstallPath}/${libopencorVersion}`)
    },
    optimizeDeps: {
      exclude: [
        '@celldl/viewer',
        '*.wasm'
      ]
    },
    plugins: [
      {
        // Plugin to strip unneeded PrimeIcons files.

        name: 'strip-unneeded-primeicons-files',
        generateBundle(_options, bundle) {
          for (const fileName of Object.keys(bundle)) {
            if (fileName.includes('assets/primeicons') && /\.(eot|svg|ttf|woff)$/.test(fileName)) {
              delete bundle[fileName];
            }
          }
        }
      },
      tailwindcssPlugin(),
      vitePlugin({
        resolvers: [primeVueAutoImportResolver.PrimeVueResolver()]
      }),
      visualizerPlugin({
        filename: 'dist/stats.html',
        gzipSize: true
      })
    ],
    vue: {
      script: {
        fs: {
          fileExists: (file: string) => nodeFs.existsSync(file),
          readFile: (file: string) => nodeFs.readFileSync(file, 'utf-8'),
          realpath: (file: string) => nodeFs.realpathSync(file)
        }
      }
    }
  }
})
