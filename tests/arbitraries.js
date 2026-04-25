/**
 * Custom fast-check arbitraries for property-based testing
 * Feature: todo-list-life-dashboard
 */

import fc from 'fast-check';

/**
 * Task arbitrary generator
 * Generates random Task objects matching the data model:
 * {
 *   id: string,           // Unique identifier (timestamp + random)
 *   text: string,         // Task description (1-500 characters)
 *   completed: boolean,   // Completion status
 *   createdAt: number     // Unix timestamp (milliseconds)
 * }
 */
export const taskArbitrary = fc.record({
  id: fc.string({ minLength: 10, maxLength: 30 }),
  text: fc.string({ minLength: 1, maxLength: 500 }).map(s => s.trim() || 'task'),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 1600000000000, max: 2000000000000 })
});

/**
 * Valid task text arbitrary (for input validation testing)
 * Generates non-empty strings after trimming, max 500 characters
 */
export const validTaskTextArbitrary = fc.string({ minLength: 1, maxLength: 500 })
  .filter(s => s.trim().length > 0);

/**
 * Quick link arbitrary generator
 * Generates random QuickLink objects matching the data model:
 * {
 *   id: string,    // Unique identifier
 *   name: string,  // Display name (1-50 characters)
 *   url: string    // Website URL (valid HTTP/HTTPS)
 * }
 */
export const quickLinkArbitrary = fc.record({
  id: fc.string({ minLength: 10, maxLength: 30 }),
  name: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim() || 'link'),
  url: fc.webUrl()
});

/**
 * Valid quick link name arbitrary (for input validation testing)
 * Generates non-empty strings after trimming, max 50 characters
 */
export const validLinkNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

/**
 * Time arbitrary generator
 * Generates random time values with hours (0-23) and minutes (0-59)
 * Used for testing time formatting and greeting logic
 */
export const timeArbitrary = fc.record({
  hours: fc.integer({ min: 0, max: 23 }),
  minutes: fc.integer({ min: 0, max: 59 })
});

/**
 * Hour arbitrary (0-23)
 */
export const hourArbitrary = fc.integer({ min: 0, max: 23 });

/**
 * Minute arbitrary (0-59)
 */
export const minuteArbitrary = fc.integer({ min: 0, max: 59 });

/**
 * Timer duration arbitrary (in seconds)
 * Range: 0-7200 seconds (0-120 minutes)
 */
export const timerDurationArbitrary = fc.integer({ min: 0, max: 7200 });

/**
 * Valid timer duration arbitrary (in minutes)
 * Range: 1-120 minutes
 */
export const validTimerMinutesArbitrary = fc.integer({ min: 1, max: 120 });

/**
 * Array of tasks arbitrary
 * Generates arrays of tasks with varying lengths
 */
export const taskArrayArbitrary = fc.array(taskArbitrary, { minLength: 0, maxLength: 20 });

/**
 * Array of quick links arbitrary
 * Generates arrays of quick links with varying lengths
 */
export const quickLinkArrayArbitrary = fc.array(quickLinkArbitrary, { minLength: 0, maxLength: 20 });

/**
 * Non-empty task array arbitrary
 * Generates arrays with at least one task
 */
export const nonEmptyTaskArrayArbitrary = fc.array(taskArbitrary, { minLength: 1, maxLength: 20 });

/**
 * Non-empty quick link array arbitrary
 * Generates arrays with at least one quick link
 */
export const nonEmptyQuickLinkArrayArbitrary = fc.array(quickLinkArbitrary, { minLength: 1, maxLength: 20 });
