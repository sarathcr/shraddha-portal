import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        all: false,
        include: [
          'src/modules/dashboard/**',
          'src/modules/profile/**',
          'src/shared/components/AppLogo.vue',
          'src/core/layouts/components/HeaderView.vue',
          'src/shared/composables/useRevenueChart.ts',
          'src/core/sidebar/sidebarStore.ts',
          'src/core/permissions/permissionChecker.ts',
        ],
        exclude: [
          'src/api/**',
          'src/modules/auth/services/**',
          'src/core/auth/authStore.ts',
          'src/core/permissions/permissionStore.ts',
          '**/*.spec.ts',
          '**/*.test.ts',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  }),
)
