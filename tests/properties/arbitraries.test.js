/**
 * Tests for custom arbitraries
 * Feature: todo-list-life-dashboard
 * 
 * Validates that all custom generators produce valid data
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { propertyTestConfig } from './config.js';
import {
  taskArbitrary,
  validTaskTextArbitrary,
  quickLinkArbitrary,
  validLinkNameArbitrary,
  timeArbitrary,
  hourArbitrary,
  minuteArbitrary,
  timerDurationArbitrary,
  validTimerMinutesArbitrary,
  taskArrayArbitrary,
  quickLinkArrayArbitrary,
  nonEmptyTaskArrayArbitrary,
  nonEmptyQuickLinkArrayArbitrary
} from '../arbitraries.js';

describe('Custom Arbitraries Validation', () => {
  describe('Task Arbitrary', () => {
    it('should generate valid task objects', () => {
      fc.assert(
        fc.property(taskArbitrary, (task) => {
          // Validate structure
          expect(task).toHaveProperty('id');
          expect(task).toHaveProperty('text');
          expect(task).toHaveProperty('completed');
          expect(task).toHaveProperty('createdAt');
          
          // Validate types
          expect(typeof task.id).toBe('string');
          expect(typeof task.text).toBe('string');
          expect(typeof task.completed).toBe('boolean');
          expect(typeof task.createdAt).toBe('number');
          
          // Validate constraints
          expect(task.id.length).toBeGreaterThanOrEqual(10);
          expect(task.id.length).toBeLessThanOrEqual(30);
          expect(task.text.length).toBeGreaterThanOrEqual(1);
          expect(task.text.length).toBeLessThanOrEqual(500);
          expect(task.createdAt).toBeGreaterThanOrEqual(1600000000000);
          expect(task.createdAt).toBeLessThanOrEqual(2000000000000);
          
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Valid Task Text Arbitrary', () => {
    it('should generate non-empty strings after trimming', () => {
      fc.assert(
        fc.property(validTaskTextArbitrary, (text) => {
          expect(text.trim().length).toBeGreaterThan(0);
          expect(text.length).toBeLessThanOrEqual(500);
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Quick Link Arbitrary', () => {
    it('should generate valid quick link objects', () => {
      fc.assert(
        fc.property(quickLinkArbitrary, (link) => {
          // Validate structure
          expect(link).toHaveProperty('id');
          expect(link).toHaveProperty('name');
          expect(link).toHaveProperty('url');
          
          // Validate types
          expect(typeof link.id).toBe('string');
          expect(typeof link.name).toBe('string');
          expect(typeof link.url).toBe('string');
          
          // Validate constraints
          expect(link.id.length).toBeGreaterThanOrEqual(10);
          expect(link.id.length).toBeLessThanOrEqual(30);
          expect(link.name.length).toBeGreaterThanOrEqual(1);
          expect(link.name.length).toBeLessThanOrEqual(50);
          expect(link.url).toMatch(/^https?:\/\//); // Valid URL format
          
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Valid Link Name Arbitrary', () => {
    it('should generate non-empty strings after trimming', () => {
      fc.assert(
        fc.property(validLinkNameArbitrary, (name) => {
          expect(name.trim().length).toBeGreaterThan(0);
          expect(name.length).toBeLessThanOrEqual(50);
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Time Arbitrary', () => {
    it('should generate valid time objects', () => {
      fc.assert(
        fc.property(timeArbitrary, (time) => {
          expect(time).toHaveProperty('hours');
          expect(time).toHaveProperty('minutes');
          expect(time.hours).toBeGreaterThanOrEqual(0);
          expect(time.hours).toBeLessThanOrEqual(23);
          expect(time.minutes).toBeGreaterThanOrEqual(0);
          expect(time.minutes).toBeLessThanOrEqual(59);
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Hour and Minute Arbitraries', () => {
    it('should generate valid hours (0-23)', () => {
      fc.assert(
        fc.property(hourArbitrary, (hour) => {
          expect(hour).toBeGreaterThanOrEqual(0);
          expect(hour).toBeLessThanOrEqual(23);
          return true;
        }),
        propertyTestConfig
      );
    });

    it('should generate valid minutes (0-59)', () => {
      fc.assert(
        fc.property(minuteArbitrary, (minute) => {
          expect(minute).toBeGreaterThanOrEqual(0);
          expect(minute).toBeLessThanOrEqual(59);
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Timer Duration Arbitraries', () => {
    it('should generate valid timer durations in seconds (0-7200)', () => {
      fc.assert(
        fc.property(timerDurationArbitrary, (duration) => {
          expect(duration).toBeGreaterThanOrEqual(0);
          expect(duration).toBeLessThanOrEqual(7200);
          return true;
        }),
        propertyTestConfig
      );
    });

    it('should generate valid timer durations in minutes (1-120)', () => {
      fc.assert(
        fc.property(validTimerMinutesArbitrary, (minutes) => {
          expect(minutes).toBeGreaterThanOrEqual(1);
          expect(minutes).toBeLessThanOrEqual(120);
          return true;
        }),
        propertyTestConfig
      );
    });
  });

  describe('Array Arbitraries', () => {
    it('should generate task arrays', () => {
      fc.assert(
        fc.property(taskArrayArbitrary, (tasks) => {
          expect(Array.isArray(tasks)).toBe(true);
          expect(tasks.length).toBeGreaterThanOrEqual(0);
          expect(tasks.length).toBeLessThanOrEqual(20);
          return true;
        }),
        propertyTestConfig
      );
    });

    it('should generate quick link arrays', () => {
      fc.assert(
        fc.property(quickLinkArrayArbitrary, (links) => {
          expect(Array.isArray(links)).toBe(true);
          expect(links.length).toBeGreaterThanOrEqual(0);
          expect(links.length).toBeLessThanOrEqual(20);
          return true;
        }),
        propertyTestConfig
      );
    });

    it('should generate non-empty task arrays', () => {
      fc.assert(
        fc.property(nonEmptyTaskArrayArbitrary, (tasks) => {
          expect(Array.isArray(tasks)).toBe(true);
          expect(tasks.length).toBeGreaterThanOrEqual(1);
          expect(tasks.length).toBeLessThanOrEqual(20);
          return true;
        }),
        propertyTestConfig
      );
    });

    it('should generate non-empty quick link arrays', () => {
      fc.assert(
        fc.property(nonEmptyQuickLinkArrayArbitrary, (links) => {
          expect(Array.isArray(links)).toBe(true);
          expect(links.length).toBeGreaterThanOrEqual(1);
          expect(links.length).toBeLessThanOrEqual(20);
          return true;
        }),
        propertyTestConfig
      );
    });
  });
});
