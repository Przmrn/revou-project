/**
 * Greeting Module
 * Feature: todo-list-life-dashboard
 * 
 * Displays current time, date, and time-based greeting message.
 * Updates every minute with automatic clock synchronization.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

const GreetingModule = (() => {
  // Private state
  let containerElement = null;
  let updateIntervalId = null;
  let timeElement = null;
  let dateElement = null;
  let greetingElement = null;

  /**
   * Format time in HH:MM format with zero-padding
   * @param {number} hours - Hour value (0-23)
   * @param {number} minutes - Minute value (0-59)
   * @returns {string} Formatted time string (e.g., "09:05", "14:30")
   */
  const formatTime = (hours, minutes) => {
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}`;
  };

  /**
   * Get greeting message based on time of day
   * @param {number} hours - Hour value (0-23)
   * @param {number} minutes - Minute value (0-59)
   * @returns {string} Greeting message
   */
  const getGreeting = (hours, minutes) => {
    // Convert to total minutes for easier comparison
    const totalMinutes = hours * 60 + minutes;
    
    // Time ranges in minutes:
    // Morning: 05:00 (300) to 11:59 (719)
    // Afternoon: 12:00 (720) to 16:59 (1019)
    // Evening: 17:00 (1020) to 20:59 (1259)
    // Night: 21:00 (1260) to 04:59 (299)
    
    if (totalMinutes >= 300 && totalMinutes <= 719) {
      return 'Good morning';
    } else if (totalMinutes >= 720 && totalMinutes <= 1019) {
      return 'Good afternoon';
    } else if (totalMinutes >= 1020 && totalMinutes <= 1259) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  /**
   * Format date in a readable format
   * @param {Date} date - Date object
   * @returns {string} Formatted date string (e.g., "Monday, January 1, 2024")
   */
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  /**
   * Update the time, date, and greeting display
   */
  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Update time display
    const timeString = formatTime(hours, minutes);
    if (timeElement) {
      timeElement.textContent = timeString;
    }
    
    // Update date display
    const dateString = formatDate(now);
    if (dateElement) {
      dateElement.textContent = dateString;
    }
    
    // Update greeting message
    const greeting = getGreeting(hours, minutes);
    if (greetingElement) {
      greetingElement.textContent = greeting;
    }
  };

  /**
   * Calculate milliseconds until the next minute
   * @returns {number} Milliseconds until next minute
   */
  const getMillisecondsUntilNextMinute = () => {
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Calculate remaining time in current minute
    const remainingSeconds = 60 - seconds;
    const remainingMilliseconds = remainingSeconds * 1000 - milliseconds;
    
    return remainingMilliseconds;
  };

  /**
   * Start the update interval synchronized with clock
   */
  const startUpdateInterval = () => {
    // Clear any existing interval
    if (updateIntervalId !== null) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }
    
    // Calculate delay to sync with next minute
    const delayToNextMinute = getMillisecondsUntilNextMinute();
    
    // Set timeout to sync with next minute, then start regular interval
    setTimeout(() => {
      updateTime(); // Update at the start of the minute
      
      // Set up regular interval (every 60 seconds)
      updateIntervalId = setInterval(updateTime, 60000);
    }, delayToNextMinute);
  };

  /**
   * Create and render the greeting component DOM structure
   */
  const render = () => {
    if (!containerElement) {
      console.error('[GreetingModule] Container element not set');
      return;
    }
    
    // Clear existing content
    containerElement.innerHTML = '';
    
    // Create greeting message element
    greetingElement = document.createElement('h1');
    greetingElement.className = 'greeting-message';
    greetingElement.setAttribute('aria-live', 'polite');
    
    // Create time element
    timeElement = document.createElement('time');
    timeElement.className = 'greeting-time';
    timeElement.setAttribute('aria-live', 'polite');
    
    // Create date element
    dateElement = document.createElement('p');
    dateElement.className = 'greeting-date';
    
    // Append elements to container
    containerElement.appendChild(greetingElement);
    containerElement.appendChild(timeElement);
    containerElement.appendChild(dateElement);
    
    // Initial update
    updateTime();
  };

  /**
   * Clean up resources (intervals)
   */
  const cleanup = () => {
    if (updateIntervalId !== null) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }
  };

  // Public API
  return {
    /**
     * Initialize the greeting module
     * @param {HTMLElement} container - DOM element to render the greeting component
     */
    init: (container) => {
      if (!container) {
        console.error('[GreetingModule] Invalid container element');
        return;
      }
      
      containerElement = container;
      
      // Render the component
      render();
      
      // Start the update interval
      startUpdateInterval();
      
      console.log('[GreetingModule] Initialized');
    },

    /**
     * Update the time display (can be called manually for testing)
     */
    updateTime: () => {
      updateTime();
    },

    /**
     * Clean up resources (call on page unload)
     */
    cleanup: () => {
      cleanup();
    },

    // Export helper functions for testing
    _test: {
      formatTime,
      getGreeting,
      formatDate
    }
  };
})();

export default GreetingModule;
