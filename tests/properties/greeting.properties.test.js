/**
 * Property-based tests for Greeting Module
 * Feature: todo-list-life-dashboard
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import GreetingModule from '../../js/greeting-module.js';
import { propertyTestConfig } from './config.js';
import { hourArbitrary, minuteArbitrary } from '../arbitraries.js';

describe('GreetingModule - Property-Based Tests', () => {
  
  // Feature: todo-list-life-dashboard, Property 1: Time Formatting
  // **Validates: Requirements 1.1**
  it('should format any valid hour (0-23) and minute (0-59) as HH:MM with zero-padding', () => {
    fc.assert(
      fc.property(
        hourArbitrary,
        minuteArbitrary,
        (hours, minutes) => {
          // Get the formatTime function from the test exports
          const formatTime = GreetingModule._test.formatTime;
          
          // Format the time
          const result = formatTime(hours, minutes);
          
          // Property 1: Result must match HH:MM format (exactly 5 characters with colon at position 2)
          expect(result).toMatch(/^\d{2}:\d{2}$/);
          
          // Property 2: Result length must be exactly 5 characters
          expect(result).toHaveLength(5);
          
          // Property 3: Character at position 2 must be a colon
          expect(result[2]).toBe(':');
          
          // Property 4: Hours part must be zero-padded and match input
          const resultHours = parseInt(result.slice(0, 2), 10);
          expect(resultHours).toBe(hours);
          
          // Property 5: Minutes part must be zero-padded and match input
          const resultMinutes = parseInt(result.slice(3, 5), 10);
          expect(resultMinutes).toBe(minutes);
          
          // Property 6: Both parts must be zero-padded (leading zeros for single digits)
          if (hours < 10) {
            expect(result[0]).toBe('0');
          }
          if (minutes < 10) {
            expect(result[3]).toBe('0');
          }
        }
      ),
      propertyTestConfig
    );
  });

  // Feature: todo-list-life-dashboard, Property 2: Greeting Message Selection
  // **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
  it('should return correct greeting for any time of day', () => {
    fc.assert(
      fc.property(
        hourArbitrary,
        minuteArbitrary,
        (hours, minutes) => {
          // Get the getGreeting function from the test exports
          const getGreeting = GreetingModule._test.getGreeting;
          
          // Get the greeting for this time
          const result = getGreeting(hours, minutes);
          
          // Convert to total minutes for easier comparison
          const totalMinutes = hours * 60 + minutes;
          
          // Property: Greeting must match the time range
          // Morning: 05:00 (300) to 11:59 (719)
          if (totalMinutes >= 300 && totalMinutes <= 719) {
            expect(result).toBe('Good morning');
          }
          // Afternoon: 12:00 (720) to 16:59 (1019)
          else if (totalMinutes >= 720 && totalMinutes <= 1019) {
            expect(result).toBe('Good afternoon');
          }
          // Evening: 17:00 (1020) to 20:59 (1259)
          else if (totalMinutes >= 1020 && totalMinutes <= 1259) {
            expect(result).toBe('Good evening');
          }
          // Night: 21:00 (1260) to 04:59 (299)
          else {
            expect(result).toBe('Good night');
          }
          
          // Additional property: Result must be one of the four valid greetings
          expect(['Good morning', 'Good afternoon', 'Good evening', 'Good night']).toContain(result);
        }
      ),
      propertyTestConfig
    );
  });
});
