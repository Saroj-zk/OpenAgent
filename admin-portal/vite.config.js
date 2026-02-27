import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../marketplace-app/server/public-portal',
    emptyOutDir: true
  },
  base: '/portal/'
})
