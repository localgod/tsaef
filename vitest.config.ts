import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.mts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.mts'],
    },
  },
});
