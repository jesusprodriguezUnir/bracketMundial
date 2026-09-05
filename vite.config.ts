import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Las landings SEO estáticas son para crawlers; los usuarios con SW
        // navegan vía la SPA (navigateFallback a index.html). No precachearlas
        // mantiene el precache ligero.
        globIgnores: [
          '**/grupos/**',
          '**/calendario/**',
          '**/estadios/**',
          '**/plantillas/**',
          '**/seleccion/**',
          '**/mundial-2026/**',
          'en/**',
        ],
        maximumFileSizeToCacheInBytes: 4194304, // 4 MiB para acomodar el bundle de datos bilingües
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        // El SW en dev oculta cambios recientes (hard reload constante);
        // poner true solo para probar la PWA en local
        enabled: false
      },
      manifest: {
        name: 'Bracket Champions',
        short_name: 'Champions',
        description: 'Porra de la Champions League 26/27',
        theme_color: '#1a1933',
        background_color: '#ecdfc0',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        categories: ['sports', 'games', 'entertainment'],
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
});
