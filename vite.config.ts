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
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'primevue-core': ['primevue', '@primevue/core', '@primeuix/themes'],
          'chart-vendor': ['chart.js'],
          'editor-vendor': ['quill'],
          'utils-vendor': ['lodash', 'yup', 'vee-validate', 'axios'],
        },
      },
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
        'src/stories/**/*',
        '**/*.d.ts',
        'src/main.ts',
        'src/**/router/**/*',
        'src/App.vue',
        'src/theme-preset.ts',
        'src/constants/api.ts',
        'src/types/**/*',
        'src/**/schemas/**/*',
      ],

      // Enforce strictly 80% coverage on statements, branches, functions, and lines
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
