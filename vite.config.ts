/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

const { USE_BUILT } = process.env

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: 'static',
  },
  plugins: [
    tsconfigPaths({
      configNames: USE_BUILT ? ['tsconfig.built.json'] : ['tsconfig.json'],
    }),
    react(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    reporters: ['default', 'html', 'junit'],
    outputFile: {
      junit: 'junit.xml',
    },
    coverage: {
      reporter: ['text', 'json', 'html', 'text-summary'],
      include: USE_BUILT ? ['dist/**/*.mjs'] : ['src'],
      exclude: ['!dist'],
      allowExternal: false,
    },
  },
})
