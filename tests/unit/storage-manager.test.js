/**
 * Unit tests for Storage Manager Module
 * Feature: todo-list-life-dashboard
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StorageManager from '../../js/storage-manager.js';

describe('StorageManager', () => {
  // Mock localStorage
  let mockStorage = {};
  
  beforeEach(() => {
    // Reset mock storage before each test
    mockStorage = {};
    
    // Mock localStorage methods
    global.window = {
      localStorage: {
        getItem: vi.fn((key) => mockStorage[key] || null),
        setItem: vi.fn((key, value) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        })
      }
    };
    
    // Mock Storage global
    global.Storage = function() {};
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(StorageManager.isAvailable()).toBe(true);
    });

    it('should return false when Storage is undefined', () => {
      delete global.Storage;
      expect(StorageManager.isAvailable()).toBe(false);
    });

    it('should return false when localStorage is not available', () => {
      global.window.localStorage = undefined;
      expect(StorageManager.isAvailable()).toBe(false);
    });

    it('should return false when localStorage throws on access', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        throw new Error('Access denied');
      });
      expect(StorageManager.isAvailable()).toBe(false);
    });
  });

  describe('getTasks', () => {
    it('should return empty array when no tasks are stored', () => {
      const tasks = StorageManager.getTasks();
      expect(tasks).toEqual([]);
    });

    it('should return stored tasks', () => {
      const testTasks = [
        { id: 'task_1', text: 'Test task', completed: false, createdAt: 1704067200000 }
      ];
      mockStorage['dashboard_tasks'] = JSON.stringify(testTasks);
      
      const tasks = StorageManager.getTasks();
      expect(tasks).toEqual(testTasks);
    });

    it('should return empty array on JSON parse error', () => {
      mockStorage['dashboard_tasks'] = 'invalid json{';
      
      const tasks = StorageManager.getTasks();
      expect(tasks).toEqual([]);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('dashboard_tasks');
    });

    it('should return empty array when stored data is not an array', () => {
      mockStorage['dashboard_tasks'] = JSON.stringify({ not: 'an array' });
      
      const tasks = StorageManager.getTasks();
      expect(tasks).toEqual([]);
    });

    it('should handle multiple tasks', () => {
      const testTasks = [
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: 1704067200000 },
        { id: 'task_2', text: 'Task 2', completed: true, createdAt: 1704070800000 }
      ];
      mockStorage['dashboard_tasks'] = JSON.stringify(testTasks);
      
      const tasks = StorageManager.getTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks).toEqual(testTasks);
    });
  });

  describe('saveTasks', () => {
    it('should save tasks to localStorage', () => {
      const testTasks = [
        { id: 'task_1', text: 'Test task', completed: false, createdAt: 1704067200000 }
      ];
      
      const result = StorageManager.saveTasks(testTasks);
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_tasks',
        JSON.stringify(testTasks)
      );
    });

    it('should return false when input is not an array', () => {
      const result = StorageManager.saveTasks('not an array');
      expect(result).toBe(false);
    });

    it('should save empty array', () => {
      const result = StorageManager.saveTasks([]);
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_tasks',
        JSON.stringify([])
      );
    });

    it('should return false on QuotaExceededError', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const result = StorageManager.saveTasks([{ id: 'task_1', text: 'Test' }]);
      expect(result).toBe(false);
    });

    it('should return false on other storage errors', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const result = StorageManager.saveTasks([{ id: 'task_1', text: 'Test' }]);
      expect(result).toBe(false);
    });
  });

  describe('getQuickLinks', () => {
    it('should return empty array when no links are stored', () => {
      const links = StorageManager.getQuickLinks();
      expect(links).toEqual([]);
    });

    it('should return stored quick links', () => {
      const testLinks = [
        { id: 'link_1', name: 'GitHub', url: 'https://github.com' }
      ];
      mockStorage['dashboard_quicklinks'] = JSON.stringify(testLinks);
      
      const links = StorageManager.getQuickLinks();
      expect(links).toEqual(testLinks);
    });

    it('should return empty array on JSON parse error', () => {
      mockStorage['dashboard_quicklinks'] = 'invalid json{';
      
      const links = StorageManager.getQuickLinks();
      expect(links).toEqual([]);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('dashboard_quicklinks');
    });

    it('should return empty array when stored data is not an array', () => {
      mockStorage['dashboard_quicklinks'] = JSON.stringify({ not: 'an array' });
      
      const links = StorageManager.getQuickLinks();
      expect(links).toEqual([]);
    });

    it('should handle multiple quick links', () => {
      const testLinks = [
        { id: 'link_1', name: 'GitHub', url: 'https://github.com' },
        { id: 'link_2', name: 'MDN', url: 'https://developer.mozilla.org' }
      ];
      mockStorage['dashboard_quicklinks'] = JSON.stringify(testLinks);
      
      const links = StorageManager.getQuickLinks();
      expect(links).toHaveLength(2);
      expect(links).toEqual(testLinks);
    });
  });

  describe('saveQuickLinks', () => {
    it('should save quick links to localStorage', () => {
      const testLinks = [
        { id: 'link_1', name: 'GitHub', url: 'https://github.com' }
      ];
      
      const result = StorageManager.saveQuickLinks(testLinks);
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_quicklinks',
        JSON.stringify(testLinks)
      );
    });

    it('should return false when input is not an array', () => {
      const result = StorageManager.saveQuickLinks('not an array');
      expect(result).toBe(false);
    });

    it('should save empty array', () => {
      const result = StorageManager.saveQuickLinks([]);
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_quicklinks',
        JSON.stringify([])
      );
    });

    it('should return false on QuotaExceededError', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const result = StorageManager.saveQuickLinks([{ id: 'link_1', name: 'Test', url: 'https://test.com' }]);
      expect(result).toBe(false);
    });
  });

  describe('getTimerDuration', () => {
    it('should return default duration (25) when not set', () => {
      const duration = StorageManager.getTimerDuration();
      expect(duration).toBe(25);
    });

    it('should return stored duration', () => {
      mockStorage['dashboard_timer_duration'] = '30';
      
      const duration = StorageManager.getTimerDuration();
      expect(duration).toBe(30);
    });

    it('should return default (25) for invalid duration', () => {
      mockStorage['dashboard_timer_duration'] = 'invalid';
      
      const duration = StorageManager.getTimerDuration();
      expect(duration).toBe(25);
    });

    it('should return default (25) for duration below minimum (1)', () => {
      mockStorage['dashboard_timer_duration'] = '0';
      
      const duration = StorageManager.getTimerDuration();
      expect(duration).toBe(25);
    });

    it('should return default (25) for duration above maximum (120)', () => {
      mockStorage['dashboard_timer_duration'] = '121';
      
      const duration = StorageManager.getTimerDuration();
      expect(duration).toBe(25);
    });

    it('should handle boundary values correctly', () => {
      mockStorage['dashboard_timer_duration'] = '1';
      expect(StorageManager.getTimerDuration()).toBe(1);
      
      mockStorage['dashboard_timer_duration'] = '120';
      expect(StorageManager.getTimerDuration()).toBe(120);
    });
  });

  describe('saveTimerDuration', () => {
    it('should save valid timer duration', () => {
      const result = StorageManager.saveTimerDuration(30);
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_timer_duration',
        '30'
      );
    });

    it('should return false for duration below minimum', () => {
      const result = StorageManager.saveTimerDuration(0);
      expect(result).toBe(false);
    });

    it('should return false for duration above maximum', () => {
      const result = StorageManager.saveTimerDuration(121);
      expect(result).toBe(false);
    });

    it('should return false for invalid duration', () => {
      const result = StorageManager.saveTimerDuration('invalid');
      expect(result).toBe(false);
    });

    it('should handle boundary values correctly', () => {
      expect(StorageManager.saveTimerDuration(1)).toBe(true);
      expect(StorageManager.saveTimerDuration(120)).toBe(true);
    });

    it('should convert string numbers to integers', () => {
      const result = StorageManager.saveTimerDuration('45');
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_timer_duration',
        '45'
      );
    });

    it('should return false on QuotaExceededError', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const result = StorageManager.saveTimerDuration(30);
      expect(result).toBe(false);
    });
  });

  describe('getUserName', () => {
    it('should return null when no name is stored', () => {
      const name = StorageManager.getUserName();
      expect(name).toBeNull();
    });

    it('should return stored user name', () => {
      mockStorage['dashboard_user_name'] = 'John Doe';
      
      const name = StorageManager.getUserName();
      expect(name).toBe('John Doe');
    });

    it('should return null on storage error', () => {
      global.window.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const name = StorageManager.getUserName();
      expect(name).toBeNull();
    });
  });

  describe('saveUserName', () => {
    it('should save valid user name', () => {
      const result = StorageManager.saveUserName('John Doe');
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_user_name',
        'John Doe'
      );
    });

    it('should trim whitespace from name', () => {
      const result = StorageManager.saveUserName('  John Doe  ');
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_user_name',
        'John Doe'
      );
    });

    it('should remove name when empty string is provided', () => {
      const result = StorageManager.saveUserName('');
      
      expect(result).toBe(true);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('dashboard_user_name');
    });

    it('should remove name when whitespace-only string is provided', () => {
      const result = StorageManager.saveUserName('   ');
      
      expect(result).toBe(true);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('dashboard_user_name');
    });

    it('should return false for non-string input', () => {
      const result = StorageManager.saveUserName(123);
      expect(result).toBe(false);
    });

    it('should return false for name exceeding 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = StorageManager.saveUserName(longName);
      expect(result).toBe(false);
    });

    it('should accept name with exactly 50 characters', () => {
      const name = 'a'.repeat(50);
      const result = StorageManager.saveUserName(name);
      expect(result).toBe(true);
    });

    it('should return false on QuotaExceededError', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const result = StorageManager.saveUserName('John Doe');
      expect(result).toBe(false);
    });
  });

  describe('getTheme', () => {
    it('should return default theme (light) when not set', () => {
      const theme = StorageManager.getTheme();
      expect(theme).toBe('light');
    });

    it('should return stored light theme', () => {
      mockStorage['dashboard_theme'] = 'light';
      
      const theme = StorageManager.getTheme();
      expect(theme).toBe('light');
    });

    it('should return stored dark theme', () => {
      mockStorage['dashboard_theme'] = 'dark';
      
      const theme = StorageManager.getTheme();
      expect(theme).toBe('dark');
    });

    it('should return default (light) for invalid theme', () => {
      mockStorage['dashboard_theme'] = 'invalid';
      
      const theme = StorageManager.getTheme();
      expect(theme).toBe('light');
    });

    it('should return default (light) on storage error', () => {
      global.window.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const theme = StorageManager.getTheme();
      expect(theme).toBe('light');
    });
  });

  describe('saveTheme', () => {
    it('should save light theme', () => {
      const result = StorageManager.saveTheme('light');
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_theme',
        'light'
      );
    });

    it('should save dark theme', () => {
      const result = StorageManager.saveTheme('dark');
      
      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_theme',
        'dark'
      );
    });

    it('should return false for invalid theme', () => {
      const result = StorageManager.saveTheme('invalid');
      expect(result).toBe(false);
    });

    it('should return false on QuotaExceededError', () => {
      global.window.localStorage.setItem = vi.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const result = StorageManager.saveTheme('dark');
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle round-trip save and load for tasks', () => {
      const testTasks = [
        { id: 'task_1', text: 'Test task', completed: false, createdAt: 1704067200000 }
      ];
      
      StorageManager.saveTasks(testTasks);
      const loadedTasks = StorageManager.getTasks();
      
      expect(loadedTasks).toEqual(testTasks);
    });

    it('should handle round-trip save and load for quick links', () => {
      const testLinks = [
        { id: 'link_1', name: 'GitHub', url: 'https://github.com' }
      ];
      
      StorageManager.saveQuickLinks(testLinks);
      const loadedLinks = StorageManager.getQuickLinks();
      
      expect(loadedLinks).toEqual(testLinks);
    });

    it('should handle round-trip save and load for timer duration', () => {
      StorageManager.saveTimerDuration(45);
      const loadedDuration = StorageManager.getTimerDuration();
      
      expect(loadedDuration).toBe(45);
    });

    it('should handle round-trip save and load for user name', () => {
      StorageManager.saveUserName('Jane Smith');
      const loadedName = StorageManager.getUserName();
      
      expect(loadedName).toBe('Jane Smith');
    });

    it('should handle round-trip save and load for theme', () => {
      StorageManager.saveTheme('dark');
      const loadedTheme = StorageManager.getTheme();
      
      expect(loadedTheme).toBe('dark');
    });
  });
});
