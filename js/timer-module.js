/**
 * Timer Module
 * Feature: todo-list-life-dashboard
 * 
 * Pomodoro-style focus timer with start, stop, and reset controls.
 * Provides countdown functionality with customizable duration.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import StorageManager from './storage-manager.js';

const TimerModule = (() => {
  // Private state
  let containerElement = null;
  let totalSeconds = 0;
  let remainingSeconds = 0;
  let isRunning = false;
  let intervalId = null;
  
  // DOM elements
  let displayElement = null;
  let startButton = null;
  let stopButton = null;
  let resetButton = null;

  /**
   * Format seconds into MM:SS format with zero-padding
   * @param {number} seconds - Total seconds to format
   * @returns {string} Formatted time string (e.g., "25:00", "04:32", "00:00")
   */
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(secs).padStart(2, '0');
    
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  /**
   * Update the timer display
   */
  const updateDisplay = () => {
    if (displayElement) {
      displayElement.textContent = formatTimer(remainingSeconds);
    }
  };

  /**
   * Update button states based on timer state
   */
  const updateButtonStates = () => {
    if (startButton && stopButton) {
      if (isRunning) {
        startButton.disabled = true;
        stopButton.disabled = false;
      } else {
        startButton.disabled = false;
        stopButton.disabled = true;
      }
    }
  };

  /**
   * Timer tick - called every second when running
   */
  const tick = () => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
      
      // Auto-stop when countdown reaches 00:00
      if (remainingSeconds === 0) {
        stop();
      }
    }
  };

  /**
   * Start the countdown timer
   */
  const start = () => {
    if (isRunning) {
      return; // Already running
    }
    
    if (remainingSeconds === 0) {
      return; // Nothing to count down
    }
    
    isRunning = true;
    updateButtonStates();
    
    // Set up interval to update every second
    intervalId = setInterval(tick, 1000);
    
    console.log('[TimerModule] Timer started');
  };

  /**
   * Stop (pause) the countdown timer
   */
  const stop = () => {
    if (!isRunning) {
      return; // Already stopped
    }
    
    isRunning = false;
    
    // Clear the interval
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    updateButtonStates();
    
    console.log('[TimerModule] Timer stopped');
  };

  /**
   * Reset the timer to initial duration
   */
  const reset = () => {
    // Stop the timer if running
    if (isRunning) {
      stop();
    }
    
    // Reset to initial duration
    remainingSeconds = totalSeconds;
    updateDisplay();
    
    console.log('[TimerModule] Timer reset');
  };

  /**
   * Set a custom timer duration
   * @param {number} minutes - Duration in minutes (1-120)
   */
  const setDuration = (minutes) => {
    const duration = parseInt(minutes, 10);
    
    // Validate range
    if (isNaN(duration) || duration < 1 || duration > 120) {
      console.error('[TimerModule] Invalid duration: must be between 1 and 120 minutes');
      return;
    }
    
    // Stop timer if running
    if (isRunning) {
      stop();
    }
    
    // Set new duration
    totalSeconds = duration * 60;
    remainingSeconds = totalSeconds;
    
    // Save to storage
    StorageManager.saveTimerDuration(duration);
    
    // Update display
    updateDisplay();
    
    console.log(`[TimerModule] Duration set to ${duration} minutes`);
  };

  /**
   * Get current timer state
   * @returns {Object} Timer state object
   */
  const getState = () => {
    return {
      isRunning: isRunning,
      remainingSeconds: remainingSeconds,
      totalSeconds: totalSeconds
    };
  };

  /**
   * Create and render the timer component DOM structure
   */
  const render = () => {
    if (!containerElement) {
      console.error('[TimerModule] Container element not set');
      return;
    }
    
    // Clear existing content
    containerElement.innerHTML = '';
    
    // Create timer display
    displayElement = document.createElement('div');
    displayElement.className = 'timer-display';
    displayElement.setAttribute('aria-live', 'polite');
    displayElement.setAttribute('aria-atomic', 'true');
    displayElement.textContent = formatTimer(remainingSeconds);
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'timer-controls';
    
    // Create start button
    startButton = document.createElement('button');
    startButton.className = 'timer-button timer-start';
    startButton.textContent = 'Start';
    startButton.setAttribute('aria-label', 'Start timer');
    startButton.addEventListener('click', start);
    
    // Create stop button
    stopButton = document.createElement('button');
    stopButton.className = 'timer-button timer-stop';
    stopButton.textContent = 'Stop';
    stopButton.setAttribute('aria-label', 'Stop timer');
    stopButton.disabled = true;
    stopButton.addEventListener('click', stop);
    
    // Create reset button
    resetButton = document.createElement('button');
    resetButton.className = 'timer-button timer-reset';
    resetButton.textContent = 'Reset';
    resetButton.setAttribute('aria-label', 'Reset timer');
    resetButton.addEventListener('click', reset);
    
    // Append buttons to controls
    controlsContainer.appendChild(startButton);
    controlsContainer.appendChild(stopButton);
    controlsContainer.appendChild(resetButton);
    
    // Append elements to container
    containerElement.appendChild(displayElement);
    containerElement.appendChild(controlsContainer);
  };

  /**
   * Clean up resources (intervals)
   */
  const cleanup = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
  };

  // Public API
  return {
    /**
     * Initialize the timer module
     * @param {HTMLElement} container - DOM element to render the timer component
     */
    init: (container) => {
      if (!container) {
        console.error('[TimerModule] Invalid container element');
        return;
      }
      
      containerElement = container;
      
      // Load duration from storage (defaults to 25 minutes)
      const durationMinutes = StorageManager.getTimerDuration();
      totalSeconds = durationMinutes * 60;
      remainingSeconds = totalSeconds;
      
      // Render the component
      render();
      
      console.log('[TimerModule] Initialized with duration:', durationMinutes, 'minutes');
    },

    /**
     * Start the countdown timer
     */
    start: () => {
      start();
    },

    /**
     * Stop (pause) the countdown timer
     */
    stop: () => {
      stop();
    },

    /**
     * Reset the timer to initial duration
     */
    reset: () => {
      reset();
    },

    /**
     * Set a custom timer duration
     * @param {number} minutes - Duration in minutes (1-120)
     */
    setDuration: (minutes) => {
      setDuration(minutes);
    },

    /**
     * Get current timer state
     * @returns {Object} Timer state with isRunning, remainingSeconds, totalSeconds
     */
    getState: () => {
      return getState();
    },

    /**
     * Clean up resources (call on page unload)
     */
    cleanup: () => {
      cleanup();
    },

    // Export helper functions for testing
    _test: {
      formatTimer
    }
  };
})();

export default TimerModule;
