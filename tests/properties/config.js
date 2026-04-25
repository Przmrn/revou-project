/**
 * Property-based testing configuration
 * Feature: todo-list-life-dashboard
 * 
 * This configuration ensures consistent test execution across all property tests:
 * - 100 iterations per property test (as specified in design document)
 * - Seed-based reproducibility for CI/CD
 * - Verbose mode for failures to show shrunk examples
 */

/**
 * Default fast-check configuration for all property tests
 * 
 * Usage in tests:
 * import { propertyTestConfig } from '../config.js';
 * 
 * fc.assert(
 *   fc.property(...),
 *   propertyTestConfig
 * );
 */
export const propertyTestConfig = {
  // Number of test runs per property
  numRuns: 100,
  
  // Verbose mode: shows shrunk counterexample on failure
  verbose: true,
  
  // Seed for reproducibility (can be overridden per test)
  // The seed is set at the Vitest level, but can be overridden here if needed
  // seed: 42,
  
  // Timeout per property test (5 seconds)
  timeout: 5000,
  
  // Enable path for better shrinking
  path: undefined,
  
  // Enable end-on-failure for faster feedback during development
  endOnFailure: false
};

/**
 * Configuration for quick smoke tests (fewer iterations)
 * Useful during development for faster feedback
 */
export const quickTestConfig = {
  numRuns: 10,
  verbose: true,
  timeout: 1000
};

/**
 * Configuration for exhaustive tests (more iterations)
 * Useful for critical properties or before releases
 */
export const exhaustiveTestConfig = {
  numRuns: 1000,
  verbose: true,
  timeout: 10000
};
