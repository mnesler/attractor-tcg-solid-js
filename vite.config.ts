import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'

export default defineConfig({
  plugins: [
    tanstackStart(),
  ],
  server: {
    port: 3000,
  },
})
