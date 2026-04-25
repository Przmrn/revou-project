import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    // Seed for reproducible property-based tests
    // Can be overridden via CLI: vitest --seed=12345
    seed: process.env.VITEST_SEED ? parseInt(process.env.VITEST_SEED) : 42,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js'
      ]
    }
  }
});
