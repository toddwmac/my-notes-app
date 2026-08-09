import { defineConfig } from 'vite'

export default defineConfig({
  base: '/my-notes-app/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
