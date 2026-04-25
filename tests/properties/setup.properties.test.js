import { describe, it } from 'vitest';
import fc from 'fast-check';
import { propertyTestConfig } from './config.js';

describe('Property-Based Test Setup Verification', () => {
  it('should run property-based test with fast-check', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          return a + b === b + a; // Commutative property of addition
        }
      ),
      propertyTestConfig
    );
  });
});
