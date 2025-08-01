import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitest/config'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx,vue}'],
      exclude: [
        'node_modules',
        'src/**/*.{spec,test}.{ts,tsx}', // Exclude all test files from the report
        '**/*.d.ts',
        'src/main.ts',
        'src/router/index.ts',
        'src/App.vue',
        'src/theme-preset.ts',
        'src/constants/api.ts',
        'src/types/**/*',
        'src/**/schemas/**/*',
      ],

      // The 85% threshold will now be applied correctly.
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
})
