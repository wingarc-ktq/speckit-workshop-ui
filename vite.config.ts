/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    pool: 'threads',
    maxWorkers: 4,
    mockReset: true,
    css: true,
    exclude: ['**/node_modules/**', '**/playwright/**', '**/.claude/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: [
        'node_modules/',
        `src/main.tsx`,
        'src/__fixtures__/**',
        'src/adapters/generated/**',
        'src/adapters/mocks/**',
        'src/i18n/locales/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
    },
  },
});
