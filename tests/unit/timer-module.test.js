/**
 * Unit Tests for Timer Module
 * Feature: todo-list-life-dashboard
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TimerModule from '../../js/timer-module.js';

describe('TimerModule', () => {
  let container;

  beforeEach(() => {
    // Create a container element for the timer
    container = document.createElement('div');
    container.id = 'timer';
    document.body.appendChild(container);

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'dashboard_timer_duration') {
          return '25'; // Default 25 minutes
        }
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    // Clean up
    TimerModule.cleanup();
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default duration of 25 minutes', () => {
      TimerModule.init(container);
      
      const state = TimerModule.getState();
      expect(state.totalSeconds).toBe(25 * 60);
      expect(state.remainingSeconds).toBe(25 * 60);
      expect(state.isRunning).toBe(false);
    });

    it('should render timer display with initial time', () => {
      TimerModule.init(container);
      
      const display = container.querySelector('.timer-display');
      expect(display).toBeTruthy();
      expect(display.textContent).toBe('25:00');
    });

    it('should render control buttons', () => {
      TimerModule.init(container);
      
      const startButton = container.querySelector('.timer-start');
      const stopButton = container.querySelector('.timer-stop');
      const resetButton = container.querySelector('.timer-reset');
      
      expect(startButton).toBeTruthy();
      expect(stopButton).toBeTruthy();
      expect(resetButton).toBeTruthy();
    });

    it('should have start button enabled and stop button disabled initially', () => {
      TimerModule.init(container);
      
      const startButton = container.querySelector('.timer-start');
      const stopButton = container.querySelector('.timer-stop');
      
      expect(startButton.disabled).toBe(false);
      expect(stopButton.disabled).toBe(true);
    });
  });

  describe('Timer Formatting', () => {
    it('should format time in MM:SS format with zero-padding', () => {
      TimerModule.init(container);
      
      const formatTimer = TimerModule._test.formatTimer;
      
      expect(formatTimer(1500)).toBe('25:00');
      expect(formatTimer(0)).toBe('00:00');
      expect(formatTimer(59)).toBe('00:59');
      expect(formatTimer(60)).toBe('01:00');
      expect(formatTimer(3599)).toBe('59:59');
      expect(formatTimer(272)).toBe('04:32');
    });
  });

  describe('Start/Stop/Reset Operations', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start the timer and update isRunning state', () => {
      TimerModule.init(container);
      
      TimerModule.start();
      
      const state = TimerModule.getState();
      expect(state.isRunning).toBe(true);
    });

    it('should update button states when timer starts', () => {
      TimerModule.init(container);
      
      const startButton = container.querySelector('.timer-start');
      const stopButton = container.querySelector('.timer-stop');
      
      TimerModule.start();
      
      expect(startButton.disabled).toBe(true);
      expect(stopButton.disabled).toBe(false);
    });

    it('should countdown when timer is running', () => {
      TimerModule.init(container);
      
      TimerModule.start();
      
      const initialState = TimerModule.getState();
      const initialRemaining = initialState.remainingSeconds;
      
      // Advance time by 3 seconds
      vi.advanceTimersByTime(3000);
      
      const newState = TimerModule.getState();
      expect(newState.remainingSeconds).toBe(initialRemaining - 3);
    });

    it('should stop the timer and preserve remaining time', () => {
      TimerModule.init(container);
      
      TimerModule.start();
      vi.advanceTimersByTime(5000); // 5 seconds
      
      TimerModule.stop();
      
      const state = TimerModule.getState();
      expect(state.isRunning).toBe(false);
      expect(state.remainingSeconds).toBe(25 * 60 - 5);
    });

    it('should update button states when timer stops', () => {
      TimerModule.init(container);
      
      TimerModule.start();
      TimerModule.stop();
      
      const startButton = container.querySelector('.timer-start');
      const stopButton = container.querySelector('.timer-stop');
      
      expect(startButton.disabled).toBe(false);
      expect(stopButton.disabled).toBe(true);
    });

    it('should reset timer to initial duration', () => {
      TimerModule.init(container);
      
      TimerModule.start();
      vi.advanceTimersByTime(10000); // 10 seconds
      
      TimerModule.reset();
      
      const state = TimerModule.getState();
      expect(state.remainingSeconds).toBe(25 * 60);
      expect(state.isRunning).toBe(false);
    });

    it('should auto-stop when countdown reaches 00:00', () => {
      TimerModule.init(container);
      TimerModule.setDuration(1); // 1 minute
      
      TimerModule.start();
      
      // Advance time by 60 seconds
      vi.advanceTimersByTime(60000);
      
      const state = TimerModule.getState();
      expect(state.remainingSeconds).toBe(0);
      expect(state.isRunning).toBe(false);
    });

    it('should update display when countdown reaches 00:00', () => {
      TimerModule.init(container);
      TimerModule.setDuration(1); // 1 minute
      
      TimerModule.start();
      vi.advanceTimersByTime(60000);
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('00:00');
    });
  });

  describe('Custom Duration', () => {
    it('should set custom duration', () => {
      TimerModule.init(container);
      
      TimerModule.setDuration(30);
      
      const state = TimerModule.getState();
      expect(state.totalSeconds).toBe(30 * 60);
      expect(state.remainingSeconds).toBe(30 * 60);
    });

    it('should update display when duration is changed', () => {
      TimerModule.init(container);
      
      TimerModule.setDuration(45);
      
      const display = container.querySelector('.timer-display');
      expect(display.textContent).toBe('45:00');
    });

    it('should stop timer when setting new duration', () => {
      vi.useFakeTimers();
      
      TimerModule.init(container);
      TimerModule.start();
      
      TimerModule.setDuration(30);
      
      const state = TimerModule.getState();
      expect(state.isRunning).toBe(false);
      
      vi.useRealTimers();
    });

    it('should reject invalid durations', () => {
      TimerModule.init(container);
      
      const initialState = TimerModule.getState();
      
      TimerModule.setDuration(0); // Too low
      expect(TimerModule.getState().totalSeconds).toBe(initialState.totalSeconds);
      
      TimerModule.setDuration(121); // Too high
      expect(TimerModule.getState().totalSeconds).toBe(initialState.totalSeconds);
      
      TimerModule.setDuration('invalid'); // Not a number
      expect(TimerModule.getState().totalSeconds).toBe(initialState.totalSeconds);
    });
  });

  describe('State Management', () => {
    it('should return correct state object', () => {
      TimerModule.init(container);
      
      const state = TimerModule.getState();
      
      expect(state).toHaveProperty('isRunning');
      expect(state).toHaveProperty('remainingSeconds');
      expect(state).toHaveProperty('totalSeconds');
      expect(typeof state.isRunning).toBe('boolean');
      expect(typeof state.remainingSeconds).toBe('number');
      expect(typeof state.totalSeconds).toBe('number');
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear interval on cleanup', () => {
      TimerModule.init(container);
      TimerModule.start();
      
      TimerModule.cleanup();
      
      const state = TimerModule.getState();
      expect(state.isRunning).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-live attribute on display', () => {
      TimerModule.init(container);
      
      const display = container.querySelector('.timer-display');
      expect(display.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-label on buttons', () => {
      TimerModule.init(container);
      
      const startButton = container.querySelector('.timer-start');
      const stopButton = container.querySelector('.timer-stop');
      const resetButton = container.querySelector('.timer-reset');
      
      expect(startButton.getAttribute('aria-label')).toBe('Start timer');
      expect(stopButton.getAttribute('aria-label')).toBe('Stop timer');
      expect(resetButton.getAttribute('aria-label')).toBe('Reset timer');
    });
  });
});
