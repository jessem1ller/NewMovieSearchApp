import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/img': {
        target: 'https://image.tmdb.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img/, ''),
      },
    },
  },
})