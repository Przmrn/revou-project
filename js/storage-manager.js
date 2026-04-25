/**
 * Storage Manager Module
 * Feature: todo-list-life-dashboard
 * 
 * Centralized interface for all Local Storage operations with error handling
 * and data validation. This module provides a consistent API for persisting
 * and retrieving application data.
 * 
 * Requirements: 7.1, 7.3, 9.1, 10.5
 */

// Storage keys used throughout the application
const STORAGE_KEYS = {
  TASKS: 'dashboard_tasks',
  QUICK_LINKS: 'dashboard_quicklinks',
  TIMER_DURATION: 'dashboard_timer_duration',
  USER_NAME: 'dashboard_user_name',
  THEME: 'dashboard_theme'
};

/**
 * Storage Manager Module
 * Provides centralized access to Local Storage with error handling
 */
const StorageManager = (() => {
  /**
   * Check if Local Storage is available in the browser
   * @returns {boolean} True if Local Storage is supported and available
   */
  const isAvailable = () => {
    try {
      if (typeof Storage === 'undefined' || !window.localStorage) {
        return false;
      }
      
      // Test if we can actually write to localStorage
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      // localStorage might be disabled or in private mode
      return false;
    }
  };

  /**
   * Get tasks from Local Storage
   * @returns {Array<Task>} Array of task objects, empty array if none exist or on error
   */
  const getTasks = () => {
    try {
      const tasksJSON = window.localStorage.getItem(STORAGE_KEYS.TASKS);
      
      if (!tasksJSON) {
        return [];
      }
      
      const tasks = JSON.parse(tasksJSON);
      
      // Validate that we got an array
      if (!Array.isArray(tasks)) {
        console.error('[StorageManager] Invalid tasks data: not an array');
        return [];
      }
      
      return tasks;
    } catch (e) {
      console.error('[StorageManager] Error parsing tasks from storage:', e);
      // Clear corrupted data
      try {
        window.localStorage.removeItem(STORAGE_KEYS.TASKS);
      } catch (clearError) {
        // Ignore errors when clearing
      }
      return [];
    }
  };

  /**
   * Save tasks to Local Storage
   * @param {Array<Task>} tasks - Array of task objects to save
   * @returns {boolean} True if save succeeded, false on error
   */
  const saveTasks = (tasks) => {
    try {
      if (!Array.isArray(tasks)) {
        console.error('[StorageManager] Cannot save tasks: not an array');
        return false;
      }
      
      const tasksJSON = JSON.stringify(tasks);
      window.localStorage.setItem(STORAGE_KEYS.TASKS, tasksJSON);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[StorageManager] Storage quota exceeded when saving tasks');
      } else {
        console.error('[StorageManager] Error saving tasks:', e);
      }
      return false;
    }
  };

  /**
   * Get quick links from Local Storage
   * @returns {Array<QuickLink>} Array of quick link objects, empty array if none exist or on error
   */
  const getQuickLinks = () => {
    try {
      const linksJSON = window.localStorage.getItem(STORAGE_KEYS.QUICK_LINKS);
      
      if (!linksJSON) {
        return [];
      }
      
      const links = JSON.parse(linksJSON);
      
      // Validate that we got an array
      if (!Array.isArray(links)) {
        console.error('[StorageManager] Invalid quick links data: not an array');
        return [];
      }
      
      return links;
    } catch (e) {
      console.error('[StorageManager] Error parsing quick links from storage:', e);
      // Clear corrupted data
      try {
        window.localStorage.removeItem(STORAGE_KEYS.QUICK_LINKS);
      } catch (clearError) {
        // Ignore errors when clearing
      }
      return [];
    }
  };

  /**
   * Save quick links to Local Storage
   * @param {Array<QuickLink>} links - Array of quick link objects to save
   * @returns {boolean} True if save succeeded, false on error
   */
  const saveQuickLinks = (links) => {
    try {
      if (!Array.isArray(links)) {
        console.error('[StorageManager] Cannot save quick links: not an array');
        return false;
      }
      
      const linksJSON = JSON.stringify(links);
      window.localStorage.setItem(STORAGE_KEYS.QUICK_LINKS, linksJSON);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[StorageManager] Storage quota exceeded when saving quick links');
      } else {
        console.error('[StorageManager] Error saving quick links:', e);
      }
      return false;
    }
  };

  /**
   * Get timer duration from Local Storage
   * @returns {number} Timer duration in minutes, defaults to 25 if not set or invalid
   */
  const getTimerDuration = () => {
    try {
      const durationStr = window.localStorage.getItem(STORAGE_KEYS.TIMER_DURATION);
      
      if (!durationStr) {
        return 25; // Default duration
      }
      
      const duration = parseInt(durationStr, 10);
      
      // Validate range (1-120 minutes)
      if (isNaN(duration) || duration < 1 || duration > 120) {
        console.warn('[StorageManager] Invalid timer duration, using default (25 minutes)');
        return 25;
      }
      
      return duration;
    } catch (e) {
      console.error('[StorageManager] Error reading timer duration:', e);
      return 25;
    }
  };

  /**
   * Save timer duration to Local Storage
   * @param {number} minutes - Timer duration in minutes (1-120)
   * @returns {boolean} True if save succeeded, false on error
   */
  const saveTimerDuration = (minutes) => {
    try {
      const duration = parseInt(minutes, 10);
      
      // Validate range
      if (isNaN(duration) || duration < 1 || duration > 120) {
        console.error('[StorageManager] Invalid timer duration: must be between 1 and 120 minutes');
        return false;
      }
      
      window.localStorage.setItem(STORAGE_KEYS.TIMER_DURATION, duration.toString());
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[StorageManager] Storage quota exceeded when saving timer duration');
      } else {
        console.error('[StorageManager] Error saving timer duration:', e);
      }
      return false;
    }
  };

  /**
   * Get user name from Local Storage (optional challenge feature)
   * @returns {string|null} User name if set, null otherwise
   */
  const getUserName = () => {
    try {
      const name = window.localStorage.getItem(STORAGE_KEYS.USER_NAME);
      return name || null;
    } catch (e) {
      console.error('[StorageManager] Error reading user name:', e);
      return null;
    }
  };

  /**
   * Save user name to Local Storage (optional challenge feature)
   * @param {string} name - User name to save
   * @returns {boolean} True if save succeeded, false on error
   */
  const saveUserName = (name) => {
    try {
      if (typeof name !== 'string') {
        console.error('[StorageManager] Invalid user name: must be a string');
        return false;
      }
      
      // Check length before trimming to reject overly long strings
      if (name.length > 50) {
        console.error('[StorageManager] Invalid user name: maximum 50 characters');
        return false;
      }
      
      const trimmedName = name.trim();
      
      if (trimmedName.length === 0) {
        // Remove the name if empty
        window.localStorage.removeItem(STORAGE_KEYS.USER_NAME);
        return true;
      }
      
      window.localStorage.setItem(STORAGE_KEYS.USER_NAME, trimmedName);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[StorageManager] Storage quota exceeded when saving user name');
      } else {
        console.error('[StorageManager] Error saving user name:', e);
      }
      return false;
    }
  };

  /**
   * Get theme preference from Local Storage (optional challenge feature)
   * @returns {string} Theme preference ('light' or 'dark'), defaults to 'light'
   */
  const getTheme = () => {
    try {
      const theme = window.localStorage.getItem(STORAGE_KEYS.THEME);
      
      if (theme === 'dark' || theme === 'light') {
        return theme;
      }
      
      return 'light'; // Default theme
    } catch (e) {
      console.error('[StorageManager] Error reading theme:', e);
      return 'light';
    }
  };

  /**
   * Save theme preference to Local Storage (optional challenge feature)
   * @param {string} theme - Theme preference ('light' or 'dark')
   * @returns {boolean} True if save succeeded, false on error
   */
  const saveTheme = (theme) => {
    try {
      if (theme !== 'light' && theme !== 'dark') {
        console.error('[StorageManager] Invalid theme: must be "light" or "dark"');
        return false;
      }
      
      window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[StorageManager] Storage quota exceeded when saving theme');
      } else {
        console.error('[StorageManager] Error saving theme:', e);
      }
      return false;
    }
  };

  // Public API
  return {
    isAvailable,
    getTasks,
    saveTasks,
    getQuickLinks,
    saveQuickLinks,
    getTimerDuration,
    saveTimerDuration,
    getUserName,
    saveUserName,
    getTheme,
    saveTheme
  };
})();

export default StorageManager;
