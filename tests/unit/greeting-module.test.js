/**
 * Unit tests for Greeting Module
 * Feature: todo-list-life-dashboard
 * 
 * Tests specific boundary times, midnight transitions, and interval cleanup.
 * Requirements: 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GreetingModule from '../../js/greeting-module.js';

describe('GreetingModule', () => {
  let container;
  
  beforeEach(() => {
    // Create a fresh container element for each test
    container = document.createElement('div');
    container.id = 'greeting-container';
    document.body.appendChild(container);
    
    // Clear any existing intervals
    vi.clearAllTimers();
  });
  
  afterEach(() => {
    // Clean up the module
    GreetingModule.cleanup();
    
    // Remove container from DOM
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Clear all mocks and timers
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('formatTime', () => {
    it('should format time with zero-padding', () => {
      const formatTime = GreetingModule._test.formatTime;
      
      expect(formatTime(9, 5)).toBe('09:05');
      expect(formatTime(14, 30)).toBe('14:30');
      expect(formatTime(0, 0)).toBe('00:00');
      expect(formatTime(23, 59)).toBe('23:59');
    });
  });

  describe('getGreeting - Boundary Times', () => {
    const getGreeting = GreetingModule._test.getGreeting;

    // Test boundary: Night → Morning transition at 05:00
    it('should return "Good night" at 04:59', () => {
      expect(getGreeting(4, 59)).toBe('Good night');
    });

    it('should return "Good morning" at 05:00', () => {
      expect(getGreeting(5, 0)).toBe('Good morning');
    });

    // Test boundary: Morning → Afternoon transition at 12:00
    it('should return "Good morning" at 11:59', () => {
      expect(getGreeting(11, 59)).toBe('Good morning');
    });

    it('should return "Good afternoon" at 12:00', () => {
      expect(getGreeting(12, 0)).toBe('Good afternoon');
    });

    // Test boundary: Afternoon → Evening transition at 17:00
    it('should return "Good afternoon" at 16:59', () => {
      expect(getGreeting(16, 59)).toBe('Good afternoon');
    });

    it('should return "Good evening" at 17:00', () => {
      expect(getGreeting(17, 0)).toBe('Good evening');
    });

    // Test boundary: Evening → Night transition at 21:00
    it('should return "Good evening" at 20:59', () => {
      expect(getGreeting(20, 59)).toBe('Good evening');
    });

    it('should return "Good night" at 21:00', () => {
      expect(getGreeting(21, 0)).toBe('Good night');
    });
  });

  describe('getGreeting - Midnight Boundary', () => {
    const getGreeting = GreetingModule._test.getGreeting;

    it('should return "Good night" at 23:59', () => {
      expect(getGreeting(23, 59)).toBe('Good night');
    });

    it('should return "Good night" at 00:00 (midnight)', () => {
      expect(getGreeting(0, 0)).toBe('Good night');
    });

    it('should handle midnight transition correctly', () => {
      // Before midnight
      expect(getGreeting(23, 59)).toBe('Good night');
      
      // At midnight
      expect(getGreeting(0, 0)).toBe('Good night');
      
      // After midnight
      expect(getGreeting(0, 1)).toBe('Good night');
    });
  });

  describe('Module Initialization', () => {
    it('should initialize and render greeting elements', () => {
      GreetingModule.init(container);
      
      const greetingMessage = container.querySelector('.greeting-message');
      const timeElement = container.querySelector('.greeting-time');
      const dateElement = container.querySelector('.greeting-date');
      
      expect(greetingMessage).not.toBeNull();
      expect(timeElement).not.toBeNull();
      expect(dateElement).not.toBeNull();
    });

    it('should set aria-live attributes for accessibility', () => {
      GreetingModule.init(container);
      
      const greetingMessage = container.querySelector('.greeting-message');
      const timeElement = container.querySelector('.greeting-time');
      
      expect(greetingMessage.getAttribute('aria-live')).toBe('polite');
      expect(timeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should display initial time and greeting', () => {
      GreetingModule.init(container);
      
      const greetingMessage = container.querySelector('.greeting-message');
      const timeElement = container.querySelector('.greeting-time');
      const dateElement = container.querySelector('.greeting-date');
      
      // Should have content
      expect(greetingMessage.textContent).toBeTruthy();
      expect(timeElement.textContent).toMatch(/^\d{2}:\d{2}$/);
      expect(dateElement.textContent).toBeTruthy();
    });

    it('should handle invalid container gracefully', () => {
      // Should not throw error
      expect(() => {
        GreetingModule.init(null);
      }).not.toThrow();
      
      expect(() => {
        GreetingModule.init(undefined);
      }).not.toThrow();
    });
  });

  describe('Interval Cleanup', () => {
    it('should clean up interval on cleanup call', () => {
      vi.useFakeTimers();
      
      // Spy on clearInterval
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      GreetingModule.init(container);
      
      // Fast-forward to ensure interval is set
      vi.advanceTimersByTime(61000);
      
      // Call cleanup
      GreetingModule.cleanup();
      
      // Verify clearInterval was called
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should not throw error when cleanup is called multiple times', () => {
      GreetingModule.init(container);
      
      expect(() => {
        GreetingModule.cleanup();
        GreetingModule.cleanup();
        GreetingModule.cleanup();
      }).not.toThrow();
    });

    it('should not throw error when cleanup is called without initialization', () => {
      expect(() => {
        GreetingModule.cleanup();
      }).not.toThrow();
    });

    it('should clear interval when cleanup is called', () => {
      vi.useFakeTimers();
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      // Set time at start of minute to avoid setTimeout delay
      vi.setSystemTime(new Date('2024-01-15T10:30:00.000'));
      
      GreetingModule.init(container);
      
      // Advance past the initial setTimeout to get to the setInterval
      vi.advanceTimersByTime(61000);
      
      // Now cleanup
      GreetingModule.cleanup();
      
      // clearInterval should have been called
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Time Updates', () => {
    it('should update time when updateTime is called manually', () => {
      vi.useFakeTimers();
      
      // Set a specific time
      const mockDate = new Date('2024-01-15T10:30:00');
      vi.setSystemTime(mockDate);
      
      GreetingModule.init(container);
      
      const timeElement = container.querySelector('.greeting-time');
      const greetingMessage = container.querySelector('.greeting-message');
      
      expect(timeElement.textContent).toBe('10:30');
      expect(greetingMessage.textContent).toBe('Good morning');
      
      // Change time to afternoon
      vi.setSystemTime(new Date('2024-01-15T14:45:00'));
      GreetingModule.updateTime();
      
      expect(timeElement.textContent).toBe('14:45');
      expect(greetingMessage.textContent).toBe('Good afternoon');
      
      vi.useRealTimers();
    });

    it('should format date correctly', () => {
      vi.useFakeTimers();
      
      const mockDate = new Date('2024-01-15T10:30:00');
      vi.setSystemTime(mockDate);
      
      GreetingModule.init(container);
      
      const dateElement = container.querySelector('.greeting-date');
      
      // Should contain day, month, and year
      expect(dateElement.textContent).toContain('2024');
      expect(dateElement.textContent).toContain('January');
      
      vi.useRealTimers();
    });
  });

  describe('Greeting Messages Throughout the Day', () => {
    const getGreeting = GreetingModule._test.getGreeting;

    it('should return correct greeting for early morning (night period)', () => {
      expect(getGreeting(2, 30)).toBe('Good night');
      expect(getGreeting(4, 0)).toBe('Good night');
    });

    it('should return correct greeting for morning period', () => {
      expect(getGreeting(6, 0)).toBe('Good morning');
      expect(getGreeting(9, 30)).toBe('Good morning');
      expect(getGreeting(11, 30)).toBe('Good morning');
    });

    it('should return correct greeting for afternoon period', () => {
      expect(getGreeting(12, 30)).toBe('Good afternoon');
      expect(getGreeting(15, 0)).toBe('Good afternoon');
      expect(getGreeting(16, 30)).toBe('Good afternoon');
    });

    it('should return correct greeting for evening period', () => {
      expect(getGreeting(17, 30)).toBe('Good evening');
      expect(getGreeting(19, 0)).toBe('Good evening');
      expect(getGreeting(20, 30)).toBe('Good evening');
    });

    it('should return correct greeting for night period', () => {
      expect(getGreeting(21, 30)).toBe('Good night');
      expect(getGreeting(23, 0)).toBe('Good night');
      expect(getGreeting(0, 30)).toBe('Good night');
    });
  });
});
