/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: 'static',
  },
  plugins: [
    tsconfigPaths(),
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    reporters: ['default', 'html'],
    coverage: {
      reporter: ['text', 'json', 'html', 'text-summary'],
      include: ['src/**'],
      allowExternal: false,
    },
  },
})
