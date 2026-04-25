/**
 * Property-based tests for Storage Manager Module
 * Feature: todo-list-life-dashboard
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import StorageManager from '../../js/storage-manager.js';
import { propertyTestConfig } from './config.js';
import {
  taskArrayArbitrary,
  quickLinkArrayArbitrary,
  validTimerMinutesArbitrary
} from '../arbitraries.js';

describe('StorageManager - Property-Based Tests', () => {
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

  // Feature: todo-list-life-dashboard, Property 8: Task Persistence Round-Trip
  it('should preserve task data through save and load cycle', () => {
    fc.assert(
      fc.property(taskArrayArbitrary, (tasks) => {
        // Save tasks
        const saveResult = StorageManager.saveTasks(tasks);
        expect(saveResult).toBe(true);
        
        // Load tasks
        const loadedTasks = StorageManager.getTasks();
        
        // Verify tasks are identical
        expect(loadedTasks).toEqual(tasks);
        expect(loadedTasks).toHaveLength(tasks.length);
        
        // Verify each task property is preserved
        tasks.forEach((task, index) => {
          expect(loadedTasks[index].id).toBe(task.id);
          expect(loadedTasks[index].text).toBe(task.text);
          expect(loadedTasks[index].completed).toBe(task.completed);
          expect(loadedTasks[index].createdAt).toBe(task.createdAt);
        });
      }),
      propertyTestConfig
    );
  });

  // Feature: todo-list-life-dashboard, Property 16: Quick Link Persistence Round-Trip
  it('should preserve quick link data through save and load cycle', () => {
    fc.assert(
      fc.property(quickLinkArrayArbitrary, (links) => {
        // Save quick links
        const saveResult = StorageManager.saveQuickLinks(links);
        expect(saveResult).toBe(true);
        
        // Load quick links
        const loadedLinks = StorageManager.getQuickLinks();
        
        // Verify links are identical
        expect(loadedLinks).toEqual(links);
        expect(loadedLinks).toHaveLength(links.length);
        
        // Verify each link property is preserved
        links.forEach((link, index) => {
          expect(loadedLinks[index].id).toBe(link.id);
          expect(loadedLinks[index].name).toBe(link.name);
          expect(loadedLinks[index].url).toBe(link.url);
        });
      }),
      propertyTestConfig
    );
  });

  // Property: Timer duration persistence round-trip
  it('should preserve timer duration through save and load cycle', () => {
    fc.assert(
      fc.property(validTimerMinutesArbitrary, (duration) => {
        // Save timer duration
        const saveResult = StorageManager.saveTimerDuration(duration);
        expect(saveResult).toBe(true);
        
        // Load timer duration
        const loadedDuration = StorageManager.getTimerDuration();
        
        // Verify duration is preserved
        expect(loadedDuration).toBe(duration);
      }),
      propertyTestConfig
    );
  });

  // Property: User name persistence round-trip
  it('should preserve user name through save and load cycle', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (name) => {
          // Save user name
          const saveResult = StorageManager.saveUserName(name);
          expect(saveResult).toBe(true);
          
          // Load user name
          const loadedName = StorageManager.getUserName();
          
          // Verify name is preserved (trimmed)
          expect(loadedName).toBe(name.trim());
        }
      ),
      propertyTestConfig
    );
  });

  // Property: Theme persistence round-trip
  it('should preserve theme through save and load cycle', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'dark'),
        (theme) => {
          // Save theme
          const saveResult = StorageManager.saveTheme(theme);
          expect(saveResult).toBe(true);
          
          // Load theme
          const loadedTheme = StorageManager.getTheme();
          
          // Verify theme is preserved
          expect(loadedTheme).toBe(theme);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: saveTasks always returns boolean
  it('should always return boolean from saveTasks', () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const result = StorageManager.saveTasks(input);
        expect(typeof result).toBe('boolean');
      }),
      propertyTestConfig
    );
  });

  // Property: saveQuickLinks always returns boolean
  it('should always return boolean from saveQuickLinks', () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const result = StorageManager.saveQuickLinks(input);
        expect(typeof result).toBe('boolean');
      }),
      propertyTestConfig
    );
  });

  // Property: getTasks always returns array
  it('should always return array from getTasks', () => {
    fc.assert(
      fc.property(fc.string(), (corruptedData) => {
        // Set potentially corrupted data
        mockStorage['dashboard_tasks'] = corruptedData;
        
        const result = StorageManager.getTasks();
        expect(Array.isArray(result)).toBe(true);
      }),
      propertyTestConfig
    );
  });

  // Property: getQuickLinks always returns array
  it('should always return array from getQuickLinks', () => {
    fc.assert(
      fc.property(fc.string(), (corruptedData) => {
        // Set potentially corrupted data
        mockStorage['dashboard_quicklinks'] = corruptedData;
        
        const result = StorageManager.getQuickLinks();
        expect(Array.isArray(result)).toBe(true);
      }),
      propertyTestConfig
    );
  });

  // Property: getTimerDuration always returns valid number
  it('should always return valid timer duration (1-120 or default 25)', () => {
    fc.assert(
      fc.property(fc.string(), (corruptedData) => {
        // Set potentially corrupted data
        mockStorage['dashboard_timer_duration'] = corruptedData;
        
        const result = StorageManager.getTimerDuration();
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(120);
      }),
      propertyTestConfig
    );
  });

  // Property: saveTimerDuration rejects invalid durations
  it('should reject timer durations outside valid range', () => {
    fc.assert(
      fc.property(
        fc.integer().filter(n => n < 1 || n > 120),
        (invalidDuration) => {
          const result = StorageManager.saveTimerDuration(invalidDuration);
          expect(result).toBe(false);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: saveTimerDuration accepts valid durations
  it('should accept timer durations within valid range', () => {
    fc.assert(
      fc.property(validTimerMinutesArbitrary, (validDuration) => {
        const result = StorageManager.saveTimerDuration(validDuration);
        expect(result).toBe(true);
      }),
      propertyTestConfig
    );
  });

  // Property: saveUserName rejects names exceeding 50 characters
  it('should reject user names exceeding 50 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51, maxLength: 100 }),
        (longName) => {
          const result = StorageManager.saveUserName(longName);
          expect(result).toBe(false);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: saveUserName accepts valid names
  it('should accept user names within valid length', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (validName) => {
          const result = StorageManager.saveUserName(validName);
          expect(result).toBe(true);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: saveTheme rejects invalid themes
  it('should reject themes other than light or dark', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s !== 'light' && s !== 'dark'),
        (invalidTheme) => {
          const result = StorageManager.saveTheme(invalidTheme);
          expect(result).toBe(false);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: Multiple save operations preserve last value
  it('should preserve last saved value for tasks after multiple saves', () => {
    fc.assert(
      fc.property(
        fc.array(taskArrayArbitrary, { minLength: 2, maxLength: 5 }),
        (taskArrays) => {
          // Save multiple times
          taskArrays.forEach(tasks => {
            StorageManager.saveTasks(tasks);
          });
          
          // Load should return the last saved value
          const loaded = StorageManager.getTasks();
          expect(loaded).toEqual(taskArrays[taskArrays.length - 1]);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: Multiple save operations preserve last value for quick links
  it('should preserve last saved value for quick links after multiple saves', () => {
    fc.assert(
      fc.property(
        fc.array(quickLinkArrayArbitrary, { minLength: 2, maxLength: 5 }),
        (linkArrays) => {
          // Save multiple times
          linkArrays.forEach(links => {
            StorageManager.saveQuickLinks(links);
          });
          
          // Load should return the last saved value
          const loaded = StorageManager.getQuickLinks();
          expect(loaded).toEqual(linkArrays[linkArrays.length - 1]);
        }
      ),
      propertyTestConfig
    );
  });

  // Property: Empty arrays are valid and preserved
  it('should handle empty task arrays correctly', () => {
    fc.assert(
      fc.property(fc.constant([]), (emptyArray) => {
        const saveResult = StorageManager.saveTasks(emptyArray);
        expect(saveResult).toBe(true);
        
        const loaded = StorageManager.getTasks();
        expect(loaded).toEqual([]);
        expect(loaded).toHaveLength(0);
      }),
      propertyTestConfig
    );
  });

  // Property: Empty arrays are valid and preserved for quick links
  it('should handle empty quick link arrays correctly', () => {
    fc.assert(
      fc.property(fc.constant([]), (emptyArray) => {
        const saveResult = StorageManager.saveQuickLinks(emptyArray);
        expect(saveResult).toBe(true);
        
        const loaded = StorageManager.getQuickLinks();
        expect(loaded).toEqual([]);
        expect(loaded).toHaveLength(0);
      }),
      propertyTestConfig
    );
  });

  // Property: Whitespace-only user names are removed
  it('should remove user name when saving whitespace-only strings', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.length > 0 && s.trim().length === 0),
        (whitespaceString) => {
          const saveResult = StorageManager.saveUserName(whitespaceString);
          expect(saveResult).toBe(true);
          
          const loaded = StorageManager.getUserName();
          expect(loaded).toBeNull();
        }
      ),
      propertyTestConfig
    );
  });

  // Property: User names are trimmed before saving
  it('should trim whitespace from user names before saving', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 0, maxLength: 5 }).map(s => s.replace(/\S/g, ' ')), // whitespace only
        fc.string({ minLength: 0, maxLength: 5 }).map(s => s.replace(/\S/g, ' ')), // whitespace only
        (name, prefix, suffix) => {
          const paddedName = prefix + name + suffix;
          
          const saveResult = StorageManager.saveUserName(paddedName);
          expect(saveResult).toBe(true);
          
          const loaded = StorageManager.getUserName();
          expect(loaded).toBe(name.trim());
        }
      ),
      propertyTestConfig
    );
  });
});
