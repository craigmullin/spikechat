import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
      ],

      manifest: {
        name: 'Chat',
        short_name: 'Chat',
        description:
          'Create fictional conversation and social-post mockups for storytelling, education, design, and prototyping.',

        theme_color: '#111216',
        background_color: '#111216',

        display: 'standalone',

        start_url: '/studio',
        scope: '/',

        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
