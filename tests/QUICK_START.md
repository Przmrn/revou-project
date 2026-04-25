# Property-Based Testing Quick Start

## What is Property-Based Testing?

Instead of writing individual test cases with specific inputs, property-based testing:
1. **Defines properties** that should always be true
2. **Generates hundreds of random inputs** automatically
3. **Finds edge cases** you might not think of
4. **Shrinks failures** to minimal counterexamples

## Quick Example

### Traditional Unit Test
```javascript
it('should add tasks correctly', () => {
  const task = { id: '1', text: 'Buy milk', completed: false, createdAt: 123 };
  addTask(task);
  expect(getTasks()).toHaveLength(1);
});
```

### Property-Based Test
```javascript
it('should add any valid task correctly', () => {
  fc.assert(
    fc.property(taskArbitrary, (task) => {
      // Tests with 100 different random tasks automatically!
      addTask(task);
      expect(getTasks()).toContain(task);
    }),
    propertyTestConfig
  );
});
```

## Using Custom Arbitraries

### Import What You Need
```javascript
import { 
  taskArbitrary,           // Random tasks
  quickLinkArbitrary,      // Random quick links
  timeArbitrary,           // Random times
  hourArbitrary,           // Random hours (0-23)
  minuteArbitrary,         // Random minutes (0-59)
  timerDurationArbitrary,  // Random durations (0-7200s)
  validTaskTextArbitrary,  // Valid task text (non-empty)
  taskArrayArbitrary       // Arrays of tasks
} from '../arbitraries.js';

import { propertyTestConfig } from './properties/config.js';
```

### Write a Property Test
```javascript
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { propertyTestConfig } from './properties/config.js';
import { taskArbitrary } from '../arbitraries.js';

describe('My Feature', () => {
  // Feature: todo-list-life-dashboard, Property X: [Name]
  // Validates: Requirements X.Y
  
  it('should preserve task data after save/load', () => {
    fc.assert(
      fc.property(
        taskArbitrary,  // Use custom arbitrary
        (task) => {
          // Your test logic
          saveTask(task);
          const loaded = loadTask(task.id);
          
          expect(loaded.text).toBe(task.text);
          expect(loaded.completed).toBe(task.completed);
          
          return true; // Property holds
        }
      ),
      propertyTestConfig  // 100 iterations, verbose mode
    );
  });
});
```

## Common Patterns

### Testing with Multiple Inputs
```javascript
fc.assert(
  fc.property(
    hourArbitrary,
    minuteArbitrary,
    (hour, minute) => {
      const formatted = formatTime(hour, minute);
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    }
  ),
  propertyTestConfig
);
```

### Testing with Arrays
```javascript
fc.assert(
  fc.property(
    taskArrayArbitrary,
    (tasks) => {
      saveTasks(tasks);
      const loaded = loadTasks();
      expect(loaded).toHaveLength(tasks.length);
    }
  ),
  propertyTestConfig
);
```

### Testing Round-Trip Operations
```javascript
fc.assert(
  fc.property(
    taskArbitrary,
    (task) => {
      // Save and load should preserve data
      save(task);
      const loaded = load(task.id);
      expect(loaded).toEqual(task);
    }
  ),
  propertyTestConfig
);
```

### Testing Invariants
```javascript
fc.assert(
  fc.property(
    validTaskTextArbitrary,
    (text) => {
      // Adding a task should always increase length by 1
      const before = getTasks().length;
      addTask(text);
      const after = getTasks().length;
      expect(after).toBe(before + 1);
    }
  ),
  propertyTestConfig
);
```

## Running Tests

```bash
# Run all tests
npm test

# Run only property tests
npm test -- tests/properties

# Run with specific seed (Windows PowerShell)
$env:VITEST_SEED=12345; npm test

# Run with specific seed (Linux/macOS)
VITEST_SEED=12345 npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## When a Test Fails

fast-check will show you:
1. **The failing input** (counterexample)
2. **The shrunk input** (minimal failing case)
3. **The seed** (for reproduction)

Example output:
```
Property failed after 47 tests
{ seed: 42, path: "46:0:1:0", endOnFailure: true }
Counterexample: [{ id: "abc123", text: "", completed: false, createdAt: 1234 }]
Shrunk 3 time(s)
Got error: Expected non-empty text
```

To reproduce:
```bash
# Windows PowerShell
$env:VITEST_SEED=42; npm test

# Linux/macOS
VITEST_SEED=42 npm test
```

## Tips

1. **Start simple** - Test one property at a time
2. **Use the right arbitrary** - Check `arbitraries.js` for available generators
3. **Keep properties focused** - One property per test
4. **Use standard config** - `propertyTestConfig` gives you 100 iterations
5. **Add comments** - Tag tests with property name and requirements

## Need Help?

- Check `tests/README.md` for detailed documentation
- Look at `tests/properties/arbitraries.test.js` for examples
- Read the [fast-check docs](https://github.com/dubzzz/fast-check)
