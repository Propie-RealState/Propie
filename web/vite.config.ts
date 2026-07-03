import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      // Include all assets from public/ in the precache manifest
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'Propie',
        short_name: 'Propie',
        description: 'Tu plataforma de propiedades inmobiliarias',
        theme_color: '#4417E6',
        background_color: '#F7F7F7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['lifestyle', 'business'],
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // NOTE: strategies === 'injectManifest', so precache config MUST live under
      // `injectManifest` (the `workbox` key is only read by the generateSW
      // strategy and was previously silently ignored). Runtime caching now lives
      // in src/sw.ts via registerRoute.
      injectManifest: {
        // Precache the application shell only: HTML + the always-needed entry,
        // vendor and page-transition chunks. Everything else (lazy routes) is
        // cached on demand at runtime, keeping the precache small.
        globPatterns: [
          'index.html',
          'assets/index-*.js',
          'assets/index-*.css',
          'assets/react-vendor-*.js',
          'assets/motion-*.js',
        ],
        // Belt-and-suspenders: never precache heavy/optional vendor chunks.
        globIgnores: [
          '**/maplibre-*.{js,css}',
          '**/recharts-*.js',
          '**/posthog-*.js',
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        // Enable the SW in dev so you can test install without a full build
        enabled: false,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    // Raise the warning threshold: the isolated maplibre chunk is inherently
    // large but is only fetched on the /mapa route, never on initial load.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Only *eagerly-loaded* vendors get a manual chunk. Heavy/optional
        // libraries (maplibre, recharts, posthog, dnd-kit) are reachable ONLY
        // through lazy routes / dynamic import, so Rollup already emits them as
        // separate async chunks that stay out of the initial bundle.
        //
        // IMPORTANT: do NOT manually chunk those dynamic-only libraries — doing
        // so makes Rollup hoist the shared Vite preload helper into that chunk,
        // which forces it to be statically imported (and eagerly downloaded) by
        // the entry. Keeping the manual chunks limited to eager vendors keeps the
        // helper in an already-eager chunk and maplibre off the initial path.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion'
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/react-router') ||
            id.includes('/scheduler/') ||
            id.includes('/zustand/')
          )
            return 'react-vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
