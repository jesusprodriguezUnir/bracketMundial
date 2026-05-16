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
          'en/**',
        ],
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Bracket Mundial 2026',
        short_name: 'Bracket26',
        description: 'Predicciones y Bracket del Mundial FIFA 2026',
        theme_color: '#1a1933',
        background_color: '#ecdfc0',
        display: 'standalone',
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
