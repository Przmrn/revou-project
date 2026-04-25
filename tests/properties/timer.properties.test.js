/**
 * Property-based tests for Timer Module
 * Feature: todo-list-life-dashboard
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import TimerModule from '../../js/timer-module.js';
import { propertyTestConfig } from './config.js';
import { timerDurationArbitrary } from '../arbitraries.js';

describe('TimerModule - Property-Based Tests', () => {
  
  // Feature: todo-list-life-dashboard, Property 3: Timer Duration Formatting
  // **Validates: Requirements 2.6**
  it('should format any valid duration in seconds (0-7200) as MM:SS with zero-padding', () => {
    fc.assert(
      fc.property(
        timerDurationArbitrary,
        (seconds) => {
          // Get the formatTimer function from the test exports
          const formatTimer = TimerModule._test.formatTimer;
          
          // Format the duration
          const result = formatTimer(seconds);
          
          // Calculate expected values
          const expectedMinutes = Math.floor(seconds / 60);
          const expectedSeconds = seconds % 60;
          
          // Property 1: Result must match M+:SS format (at least 2 digits for minutes, colon, exactly 2 digits for seconds)
          // For 0-99 minutes: MM:SS (5 chars), for 100+ minutes: MMM:SS (6+ chars)
          expect(result).toMatch(/^\d{2,}:\d{2}$/);
          
          // Property 2: Must contain exactly one colon
          const colonCount = (result.match(/:/g) || []).length;
          expect(colonCount).toBe(1);
          
          // Property 3: Find colon position and validate structure
          const colonIndex = result.indexOf(':');
          expect(colonIndex).toBeGreaterThanOrEqual(2); // At least 2 digits for minutes
          expect(result.length - colonIndex).toBe(3); // Colon + 2 digits for seconds
          
          // Property 4: Minutes part must match calculated value
          const resultMinutes = parseInt(result.slice(0, colonIndex), 10);
          expect(resultMinutes).toBe(expectedMinutes);
          
          // Property 5: Seconds part must be exactly 2 digits and match calculated value
          const secondsPart = result.slice(colonIndex + 1);
          expect(secondsPart).toHaveLength(2);
          const resultSeconds = parseInt(secondsPart, 10);
          expect(resultSeconds).toBe(expectedSeconds);
          
          // Property 6: Minutes must be zero-padded to at least 2 digits
          if (expectedMinutes < 10) {
            expect(result[0]).toBe('0');
          }
          
          // Property 7: Seconds must always be zero-padded to exactly 2 digits
          if (expectedSeconds < 10) {
            expect(secondsPart[0]).toBe('0');
          }
        }
      ),
      propertyTestConfig
    );
  });

  // Feature: todo-list-life-dashboard, Property 4: Timer State Preservation on Stop
  // **Validates: Requirements 2.3**
  it('should preserve correct remaining time when timer is started, advanced, then stopped', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 120 }), // Initial duration in minutes (10-120)
        fc.integer({ min: 1, max: 300 }),  // Advance time in seconds (1-300, i.e., 5 minutes max)
        (initialMinutes, advanceSeconds) => {
          // Use fake timers for this test
          vi.useFakeTimers();
          
          try {
            // Create a mock container element
            const mockContainer = document.createElement('div');
            
            // Initialize timer with random duration
            TimerModule.init(mockContainer);
            TimerModule.setDuration(initialMinutes);
            
            // Get initial state
            const initialState = TimerModule.getState();
            const initialTotalSeconds = initialMinutes * 60;
            
            // Property 1: Initial state should match the set duration
            expect(initialState.totalSeconds).toBe(initialTotalSeconds);
            expect(initialState.remainingSeconds).toBe(initialTotalSeconds);
            expect(initialState.isRunning).toBe(false);
            
            // Ensure we don't advance more time than available
            const actualAdvanceSeconds = Math.min(advanceSeconds, initialTotalSeconds - 1);
            
            // Start the timer
            TimerModule.start();
            
            // Get state after starting
            const runningState = TimerModule.getState();
            
            // Property 2: Timer should be running after start
            expect(runningState.isRunning).toBe(true);
            expect(runningState.remainingSeconds).toBe(initialTotalSeconds);
            
            // Advance time by the random amount (in milliseconds)
            vi.advanceTimersByTime(actualAdvanceSeconds * 1000);
            
            // Get state after time advancement
            const advancedState = TimerModule.getState();
            const expectedRemainingSeconds = initialTotalSeconds - actualAdvanceSeconds;
            
            // Property 3: Remaining time should have decreased by the advanced amount
            expect(advancedState.remainingSeconds).toBe(expectedRemainingSeconds);
            expect(advancedState.isRunning).toBe(true);
            
            // Stop the timer
            TimerModule.stop();
            
            const stoppedState = TimerModule.getState();
            
            // Property 4: Timer should not be running after stop
            expect(stoppedState.isRunning).toBe(false);
            
            // Property 5: Remaining time should be preserved after stop (same as before stop)
            expect(stoppedState.remainingSeconds).toBe(expectedRemainingSeconds);
            
            // Property 6: Total seconds should remain unchanged throughout
            expect(stoppedState.totalSeconds).toBe(initialTotalSeconds);
            
            // Clean up
            TimerModule.cleanup();
          } finally {
            // Always restore real timers
            vi.useRealTimers();
          }
        }
      ),
      propertyTestConfig
    );
  });

  // Feature: todo-list-life-dashboard, Property 5: Timer Reset Round-Trip
  // **Validates: Requirements 2.4**
  it('should return timer to initial duration after starting, advancing, then resetting', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 120 }), // Initial duration in minutes (10-120)
        fc.integer({ min: 1, max: 300 }),  // Advance time in seconds (1-300, i.e., 5 minutes max)
        (initialMinutes, advanceSeconds) => {
          // Use fake timers for this test
          vi.useFakeTimers();
          
          try {
            // Create a mock container element
            const mockContainer = document.createElement('div');
            
            // Initialize timer with random duration
            TimerModule.init(mockContainer);
            TimerModule.setDuration(initialMinutes);
            
            // Get initial state
            const initialState = TimerModule.getState();
            const initialTotalSeconds = initialMinutes * 60;
            
            // Property 1: Initial state should match the set duration
            expect(initialState.totalSeconds).toBe(initialTotalSeconds);
            expect(initialState.remainingSeconds).toBe(initialTotalSeconds);
            expect(initialState.isRunning).toBe(false);
            
            // Ensure we don't advance more time than available
            const actualAdvanceSeconds = Math.min(advanceSeconds, initialTotalSeconds - 1);
            
            // Start the timer
            TimerModule.start();
            
            // Get state after starting
            const runningState = TimerModule.getState();
            
            // Property 2: Timer should be running after start
            expect(runningState.isRunning).toBe(true);
            expect(runningState.remainingSeconds).toBe(initialTotalSeconds);
            
            // Advance time by the random amount (in milliseconds)
            vi.advanceTimersByTime(actualAdvanceSeconds * 1000);
            
            // Get state after time advancement
            const advancedState = TimerModule.getState();
            const expectedRemainingSeconds = initialTotalSeconds - actualAdvanceSeconds;
            
            // Property 3: Remaining time should have decreased by the advanced amount
            expect(advancedState.remainingSeconds).toBe(expectedRemainingSeconds);
            expect(advancedState.isRunning).toBe(true);
            
            // Reset the timer
            TimerModule.reset();
            
            const resetState = TimerModule.getState();
            
            // Property 4: Timer should not be running after reset
            expect(resetState.isRunning).toBe(false);
            
            // Property 5: Remaining seconds should be restored to initial duration
            expect(resetState.remainingSeconds).toBe(initialTotalSeconds);
            
            // Property 6: Total seconds should remain unchanged throughout
            expect(resetState.totalSeconds).toBe(initialTotalSeconds);
            
            // Property 7: Reset should restore timer to exact initial state (round-trip property)
            expect(resetState.remainingSeconds).toBe(initialState.remainingSeconds);
            expect(resetState.totalSeconds).toBe(initialState.totalSeconds);
            
            // Clean up
            TimerModule.cleanup();
          } finally {
            // Always restore real timers
            vi.useRealTimers();
          }
        }
      ),
      propertyTestConfig
    );
  });
});
