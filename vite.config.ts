import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 750,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
