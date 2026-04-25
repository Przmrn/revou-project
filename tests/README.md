# Testing Documentation

## Overview

This project uses a dual testing approach combining property-based testing with example-based unit tests to ensure comprehensive correctness guarantees.

## Test Structure

```
tests/
├── arbitraries.js              # Custom fast-check generators
├── properties/                 # Property-based tests
│   ├── config.js              # PBT configuration (100 iterations)
│   ├── arbitraries.test.js    # Validates custom generators
│   └── setup.properties.test.js # Setup verification
└── unit/                       # Unit tests
    └── setup.test.js          # Setup verification
```

## Property-Based Testing

### Framework

We use [fast-check](https://github.com/dubzzz/fast-check) for property-based testing, which:
- Generates hundreds of random test cases per property
- Automatically shrinks failing examples to minimal counterexamples
- Provides seed-based reproducibility for CI/CD

### Configuration

All property tests run with the following configuration (defined in `tests/properties/config.js`):

- **100 iterations** per property test (as specified in design document)
- **Verbose mode** enabled to show shrunk counterexamples on failure
- **5 second timeout** per property test
- **Seed-based reproducibility** for consistent CI/CD results

### Custom Arbitraries

We've created custom generators for domain-specific data types:

#### Task Arbitrary
```javascript
import { taskArbitrary } from './arbitraries.js';

// Generates: { id, text, completed, createdAt }
// - id: 10-30 character string
// - text: 1-500 character string (non-empty after trim)
// - completed: boolean
// - createdAt: Unix timestamp (1600000000000-2000000000000)
```

#### Quick Link Arbitrary
```javascript
import { quickLinkArbitrary } from './arbitraries.js';

// Generates: { id, name, url }
// - id: 10-30 character string
// - name: 1-50 character string (non-empty after trim)
// - url: Valid HTTP/HTTPS URL
```

#### Time Arbitrary
```javascript
import { timeArbitrary, hourArbitrary, minuteArbitrary } from './arbitraries.js';

// timeArbitrary generates: { hours: 0-23, minutes: 0-59 }
// hourArbitrary generates: 0-23
// minuteArbitrary generates: 0-59
```

#### Timer Duration Arbitrary
```javascript
import { timerDurationArbitrary, validTimerMinutesArbitrary } from './arbitraries.js';

// timerDurationArbitrary: 0-7200 seconds
// validTimerMinutesArbitrary: 1-120 minutes
```

#### Array Arbitraries
```javascript
import { 
  taskArrayArbitrary,
  quickLinkArrayArbitrary,
  nonEmptyTaskArrayArbitrary,
  nonEmptyQuickLinkArrayArbitrary 
} from './arbitraries.js';

// Generates arrays with 0-20 items (or 1-20 for non-empty variants)
```

### Usage Example

```javascript
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { propertyTestConfig } from './properties/config.js';
import { taskArbitrary } from './arbitraries.js';

describe('Task Module', () => {
  it('should preserve task properties after save/load', () => {
    fc.assert(
      fc.property(taskArbitrary, (task) => {
        // Test logic here
        return true;
      }),
      propertyTestConfig // Uses 100 iterations, verbose mode, etc.
    );
  });
});
```

## Seed-Based Reproducibility

### Default Seed

The test suite uses a default seed of `42` for reproducibility. This is configured in `vitest.config.js`.

### Overriding the Seed

You can override the seed for debugging or CI/CD:

**Windows (PowerShell):**
```powershell
$env:VITEST_SEED=12345; npm test
```

**Linux/macOS (Bash):**
```bash
VITEST_SEED=12345 npm test
```

**Cross-platform (using npm script):**
```bash
SEED=12345 npm run test:seed
```

### CI/CD Integration

For CI/CD pipelines, you can:

1. **Use a fixed seed** (default: 42) for consistent results
2. **Use a random seed** and log it for reproducibility:
   ```bash
   SEED=$RANDOM
   echo "Running tests with seed: $SEED"
   VITEST_SEED=$SEED npm test
   ```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run only property tests
npm test -- tests/properties

# Run only unit tests
npm test -- tests/unit

# Run with specific seed (Windows PowerShell)
$env:VITEST_SEED=12345; npm test

# Run with specific seed (Linux/macOS)
VITEST_SEED=12345 npm test
```

## Test Configuration Variants

The `tests/properties/config.js` file provides three configuration presets:

### Standard Configuration (Default)
```javascript
import { propertyTestConfig } from './properties/config.js';
// 100 iterations, 5s timeout
```

### Quick Configuration (Development)
```javascript
import { quickTestConfig } from './properties/config.js';
// 10 iterations, 1s timeout - for faster feedback during development
```

### Exhaustive Configuration (Pre-Release)
```javascript
import { exhaustiveTestConfig } from './properties/config.js';
// 1000 iterations, 10s timeout - for critical properties before releases
```

## Writing Property Tests

### Property Test Template

```javascript
// Feature: todo-list-life-dashboard, Property X: [Property Name]
// Validates: Requirements X.Y, X.Z

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { propertyTestConfig } from './properties/config.js';
import { taskArbitrary } from './arbitraries.js';

describe('[Module Name] Properties', () => {
  it('[property description]', () => {
    fc.assert(
      fc.property(
        taskArbitrary,
        (task) => {
          // Arrange
          // Act
          // Assert
          return true; // or use expect()
        }
      ),
      propertyTestConfig
    );
  });
});
```

### Best Practices

1. **Tag each property test** with a comment referencing the design document
2. **Use descriptive test names** that explain what property is being tested
3. **Keep properties simple** - test one property per test
4. **Use the standard config** unless you have a specific reason to change it
5. **Document any custom arbitraries** in this README

## Coverage Goals

- **Overall**: 90%+
- **Critical paths** (storage, task CRUD): 100%
- **UI interaction handlers**: 85%+
- **Error handling**: 100%

## Troubleshooting

### Test Failures

If a property test fails:

1. **Check the counterexample** - fast-check will show the minimal failing input
2. **Reproduce with seed** - use the seed from the failure to reproduce
3. **Debug with fewer iterations** - use `quickTestConfig` to iterate faster
4. **Verify the property** - ensure the property is correctly specified

### Slow Tests

If tests are too slow:

1. **Use quickTestConfig** during development
2. **Reduce timeout** if tests are hanging
3. **Check for infinite loops** in test logic
4. **Profile with Vitest UI** (`npm run test:ui`)

### Flaky Tests

If tests are inconsistent:

1. **Check for timing issues** - use fake timers for time-dependent code
2. **Verify seed usage** - ensure seed is being applied correctly
3. **Look for side effects** - ensure tests are isolated
4. **Check async operations** - ensure proper awaiting

## References

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Vitest Documentation](https://vitest.dev/)
- [Property-Based Testing Guide](https://fsharpforfunandprofit.com/posts/property-based-testing/)
