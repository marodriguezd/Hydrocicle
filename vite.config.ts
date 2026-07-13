import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Hydrocicle/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        mode: 'development'
      },
      manifest: {
        name: 'Hydrocicle',
        short_name: 'Hydrocicle',
        description: 'Guided contrast therapy and cold exposure shower timer.',
        theme_color: '#4ca1af',
        background_color: '#0f2027',
        display: 'standalone',
        icons: [
          {
            src: './assets/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: './assets/icon-monochrome.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'monochrome'
          }
        ]
      }
    })
  ],
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  }
});
