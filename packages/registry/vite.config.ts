import react from '@vitejs/plugin-react'
import path from 'path'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  base: '/awesome/registry',
  resolve: {
    alias: {
      '@/convex.generated': path.resolve(__dirname, './convex/_generated'),
      '@/convex': path.resolve(__dirname, './convex'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
