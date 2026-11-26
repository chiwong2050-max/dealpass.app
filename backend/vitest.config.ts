import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only backend tests run here; the root config handles the frontend.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
