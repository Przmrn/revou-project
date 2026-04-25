/**
 * Unit tests for Task Module
 * Feature: todo-list-life-dashboard
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TaskModule from '../../js/task-module.js';

describe('TaskModule', () => {
  let mockStorageManager;
  let mockContainer;
  let storedTasks;

  beforeEach(() => {
    // Reset stored tasks
    storedTasks = [];

    // Create mock storage manager
    mockStorageManager = {
      getTasks: vi.fn(() => [...storedTasks]),
      saveTasks: vi.fn((tasks) => {
        storedTasks = [...tasks];
        return true;
      })
    };

    // Create mock container element
    mockContainer = document.createElement('div');
    mockContainer.id = 'task-container';
    document.body.appendChild(mockContainer);

    // Create a new TaskModule instance with mock storage
    global.StorageManager = mockStorageManager;
  });

  afterEach(() => {
    // Clean up DOM
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer);
    }
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize with empty task list', () => {
      const module = TaskModule;
      module.init(mockContainer);

      expect(mockStorageManager.getTasks).toHaveBeenCalled();
      expect(mockContainer.children.length).toBe(0);
    });

    it('should load and render existing tasks', () => {
      storedTasks = [
        { id: 'task_1', text: 'Test task 1', completed: false, createdAt: Date.now() },
        { id: 'task_2', text: 'Test task 2', completed: true, createdAt: Date.now() }
      ];

      const module = TaskModule;
      module.init(mockContainer);

      expect(mockContainer.children.length).toBe(2);
    });

    it('should not initialize with null container', () => {
      const module = TaskModule;
      module.init(null);

      expect(mockStorageManager.getTasks).not.toHaveBeenCalled();
    });
  });

  describe('addTask', () => {
    beforeEach(() => {
      TaskModule.init(mockContainer);
    });

    it('should add task with valid text', () => {
      const result = TaskModule.addTask('Buy groceries');

      expect(result).toBe(true);
      expect(mockStorageManager.saveTasks).toHaveBeenCalled();
      expect(storedTasks).toHaveLength(1);
      expect(storedTasks[0].text).toBe('Buy groceries');
      expect(storedTasks[0].completed).toBe(false);
      expect(storedTasks[0].id).toMatch(/^task_\d+_/);
      expect(storedTasks[0].createdAt).toBeGreaterThan(0);
    });

    it('should trim whitespace from task text', () => {
      const result = TaskModule.addTask('  Task with spaces  ');

      expect(result).toBe(true);
      expect(storedTasks[0].text).toBe('Task with spaces');
    });

    it('should reject empty task text', () => {
      const result = TaskModule.addTask('');

      expect(result).toBe(false);
      expect(storedTasks).toHaveLength(0);
    });

    it('should reject whitespace-only task text', () => {
      const result = TaskModule.addTask('   ');

      expect(result).toBe(false);
      expect(storedTasks).toHaveLength(0);
    });

    it('should reject task text exceeding 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = TaskModule.addTask(longText);

      expect(result).toBe(false);
      expect(storedTasks).toHaveLength(0);
    });

    it('should accept task text with exactly 500 characters', () => {
      const maxText = 'a'.repeat(500);
      const result = TaskModule.addTask(maxText);

      expect(result).toBe(true);
      expect(storedTasks[0].text).toBe(maxText);
    });

    it('should reject non-string input', () => {
      const result = TaskModule.addTask(123);

      expect(result).toBe(false);
      expect(storedTasks).toHaveLength(0);
    });

    it('should render task in DOM', () => {
      TaskModule.addTask('Test task');

      expect(mockContainer.children.length).toBe(1);
      const taskElement = mockContainer.children[0];
      expect(taskElement.querySelector('.task-text').textContent).toBe('Test task');
    });

    it('should rollback on storage failure', () => {
      mockStorageManager.saveTasks = vi.fn(() => false);

      const result = TaskModule.addTask('Test task');

      expect(result).toBe(false);
      expect(TaskModule.getTasks()).toHaveLength(0);
    });

    it('should generate unique IDs for multiple tasks', () => {
      TaskModule.addTask('Task 1');
      TaskModule.addTask('Task 2');
      TaskModule.addTask('Task 3');

      const tasks = TaskModule.getTasks();
      const ids = tasks.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('editTask', () => {
    let taskId;

    beforeEach(() => {
      TaskModule.init(mockContainer);
      TaskModule.addTask('Original task');
      taskId = storedTasks[0].id;
    });

    it('should edit task with valid text', () => {
      const result = TaskModule.editTask(taskId, 'Updated task');

      expect(result).toBe(true);
      expect(storedTasks[0].text).toBe('Updated task');
      expect(mockStorageManager.saveTasks).toHaveBeenCalled();
    });

    it('should trim whitespace from new text', () => {
      const result = TaskModule.editTask(taskId, '  Updated task  ');

      expect(result).toBe(true);
      expect(storedTasks[0].text).toBe('Updated task');
    });

    it('should reject empty text', () => {
      const result = TaskModule.editTask(taskId, '');

      expect(result).toBe(false);
      expect(storedTasks[0].text).toBe('Original task');
    });

    it('should reject whitespace-only text', () => {
      const result = TaskModule.editTask(taskId, '   ');

      expect(result).toBe(false);
      expect(storedTasks[0].text).toBe('Original task');
    });

    it('should reject text exceeding 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = TaskModule.editTask(taskId, longText);

      expect(result).toBe(false);
      expect(storedTasks[0].text).toBe('Original task');
    });

    it('should accept text with exactly 500 characters', () => {
      const maxText = 'b'.repeat(500);
      const result = TaskModule.editTask(taskId, maxText);

      expect(result).toBe(true);
      expect(storedTasks[0].text).toBe(maxText);
    });

    it('should return false for non-existent task', () => {
      const result = TaskModule.editTask('invalid_id', 'New text');

      expect(result).toBe(false);
    });

    it('should update DOM after edit', () => {
      TaskModule.editTask(taskId, 'Updated task');

      const taskElement = mockContainer.querySelector(`[data-task-id="${taskId}"]`);
      expect(taskElement.querySelector('.task-text').textContent).toBe('Updated task');
    });

    it('should rollback on storage failure', () => {
      mockStorageManager.saveTasks = vi.fn(() => false);

      const result = TaskModule.editTask(taskId, 'Updated task');

      expect(result).toBe(false);
      expect(storedTasks[0].text).toBe('Original task');
    });

    it('should preserve other task properties', () => {
      const originalCompleted = storedTasks[0].completed;
      const originalCreatedAt = storedTasks[0].createdAt;

      TaskModule.editTask(taskId, 'Updated task');

      expect(storedTasks[0].completed).toBe(originalCompleted);
      expect(storedTasks[0].createdAt).toBe(originalCreatedAt);
      expect(storedTasks[0].id).toBe(taskId);
    });
  });

  describe('deleteTask', () => {
    let taskId;

    beforeEach(() => {
      TaskModule.init(mockContainer);
      TaskModule.addTask('Task to delete');
      taskId = storedTasks[0].id;
    });

    it('should delete existing task', () => {
      const result = TaskModule.deleteTask(taskId);

      expect(result).toBe(true);
      expect(storedTasks).toHaveLength(0);
      expect(mockStorageManager.saveTasks).toHaveBeenCalled();
    });

    it('should remove task from DOM', () => {
      TaskModule.deleteTask(taskId);

      expect(mockContainer.children.length).toBe(0);
    });

    it('should return false for non-existent task', () => {
      const result = TaskModule.deleteTask('invalid_id');

      expect(result).toBe(false);
      expect(storedTasks).toHaveLength(1);
    });

    it('should delete correct task from multiple tasks', () => {
      TaskModule.addTask('Task 2');
      TaskModule.addTask('Task 3');
      const task2Id = storedTasks[1].id;

      TaskModule.deleteTask(task2Id);

      expect(storedTasks).toHaveLength(2);
      expect(storedTasks.find(t => t.id === task2Id)).toBeUndefined();
      expect(storedTasks[0].text).toBe('Task to delete');
      expect(storedTasks[1].text).toBe('Task 3');
    });

    it('should rollback on storage failure', () => {
      mockStorageManager.saveTasks = vi.fn(() => false);

      const result = TaskModule.deleteTask(taskId);

      expect(result).toBe(false);
      expect(storedTasks).toHaveLength(1);
    });
  });

  describe('toggleComplete', () => {
    let taskId;

    beforeEach(() => {
      TaskModule.init(mockContainer);
      TaskModule.addTask('Task to toggle');
      taskId = storedTasks[0].id;
    });

    it('should toggle task from incomplete to complete', () => {
      const result = TaskModule.toggleComplete(taskId);

      expect(result).toBe(true);
      expect(storedTasks[0].completed).toBe(true);
      expect(mockStorageManager.saveTasks).toHaveBeenCalled();
    });

    it('should toggle task from complete to incomplete', () => {
      // First toggle to complete
      TaskModule.toggleComplete(taskId);
      // Then toggle back to incomplete
      const result = TaskModule.toggleComplete(taskId);

      expect(result).toBe(true);
      expect(storedTasks[0].completed).toBe(false);
    });

    it('should update DOM styling when toggling to complete', () => {
      TaskModule.toggleComplete(taskId);

      const taskElement = mockContainer.querySelector(`[data-task-id="${taskId}"]`);
      expect(taskElement.classList.contains('task-completed')).toBe(true);
    });

    it('should update DOM styling when toggling to incomplete', () => {
      TaskModule.toggleComplete(taskId); // Complete
      TaskModule.toggleComplete(taskId); // Incomplete

      const taskElement = mockContainer.querySelector(`[data-task-id="${taskId}"]`);
      expect(taskElement.classList.contains('task-completed')).toBe(false);
    });

    it('should return false for non-existent task', () => {
      const result = TaskModule.toggleComplete('invalid_id');

      expect(result).toBe(false);
    });

    it('should rollback on storage failure', () => {
      mockStorageManager.saveTasks = vi.fn(() => false);

      const result = TaskModule.toggleComplete(taskId);

      expect(result).toBe(false);
      expect(storedTasks[0].completed).toBe(false);
    });

    it('should preserve other task properties', () => {
      const originalText = storedTasks[0].text;
      const originalCreatedAt = storedTasks[0].createdAt;

      TaskModule.toggleComplete(taskId);

      expect(storedTasks[0].text).toBe(originalText);
      expect(storedTasks[0].createdAt).toBe(originalCreatedAt);
      expect(storedTasks[0].id).toBe(taskId);
    });
  });

  describe('getTasks', () => {
    beforeEach(() => {
      TaskModule.init(mockContainer);
    });

    it('should return empty array when no tasks exist', () => {
      const tasks = TaskModule.getTasks();

      expect(tasks).toEqual([]);
    });

    it('should return all tasks', () => {
      TaskModule.addTask('Task 1');
      TaskModule.addTask('Task 2');

      const tasks = TaskModule.getTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].text).toBe('Task 1');
      expect(tasks[1].text).toBe('Task 2');
    });

    it('should return a copy of tasks array', () => {
      TaskModule.addTask('Task 1');

      const tasks1 = TaskModule.getTasks();
      const tasks2 = TaskModule.getTasks();

      expect(tasks1).not.toBe(tasks2); // Different array instances
      expect(tasks1).toEqual(tasks2); // Same content
    });

    it('should not allow external modification of tasks', () => {
      TaskModule.addTask('Task 1');

      const tasks = TaskModule.getTasks();
      tasks.push({ id: 'fake', text: 'Fake task', completed: false });

      const actualTasks = TaskModule.getTasks();
      expect(actualTasks).toHaveLength(1);
    });
  });

  describe('sortTasks', () => {
    beforeEach(() => {
      TaskModule.init(mockContainer);
    });

    it('should sort tasks by creation order', () => {
      // Add tasks with specific timestamps
      const now = Date.now();
      storedTasks = [
        { id: 'task_3', text: 'Task 3', completed: false, createdAt: now + 2000 },
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: now },
        { id: 'task_2', text: 'Task 2', completed: false, createdAt: now + 1000 }
      ];
      TaskModule.init(mockContainer);

      TaskModule.sortTasks('creation');

      const tasks = TaskModule.getTasks();
      expect(tasks[0].text).toBe('Task 1');
      expect(tasks[1].text).toBe('Task 2');
      expect(tasks[2].text).toBe('Task 3');
    });

    it('should sort tasks by completion status', () => {
      const now = Date.now();
      storedTasks = [
        { id: 'task_1', text: 'Completed 1', completed: true, createdAt: now },
        { id: 'task_2', text: 'Incomplete 1', completed: false, createdAt: now + 1000 },
        { id: 'task_3', text: 'Completed 2', completed: true, createdAt: now + 2000 },
        { id: 'task_4', text: 'Incomplete 2', completed: false, createdAt: now + 3000 }
      ];
      TaskModule.init(mockContainer);

      TaskModule.sortTasks('completion');

      const tasks = TaskModule.getTasks();
      expect(tasks[0].completed).toBe(false);
      expect(tasks[1].completed).toBe(false);
      expect(tasks[2].completed).toBe(true);
      expect(tasks[3].completed).toBe(true);
    });

    it('should maintain creation order within completion groups', () => {
      const now = Date.now();
      storedTasks = [
        { id: 'task_1', text: 'Completed 1', completed: true, createdAt: now },
        { id: 'task_2', text: 'Incomplete 1', completed: false, createdAt: now + 1000 },
        { id: 'task_3', text: 'Incomplete 2', completed: false, createdAt: now + 2000 }
      ];
      TaskModule.init(mockContainer);

      TaskModule.sortTasks('completion');

      const tasks = TaskModule.getTasks();
      expect(tasks[0].text).toBe('Incomplete 1');
      expect(tasks[1].text).toBe('Incomplete 2');
      expect(tasks[2].text).toBe('Completed 1');
    });

    it('should save sorted order to storage', () => {
      const now = Date.now();
      storedTasks = [
        { id: 'task_2', text: 'Task 2', completed: false, createdAt: now + 1000 },
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: now }
      ];
      TaskModule.init(mockContainer);

      TaskModule.sortTasks('creation');

      expect(mockStorageManager.saveTasks).toHaveBeenCalled();
    });

    it('should re-render tasks after sorting', () => {
      const now = Date.now();
      storedTasks = [
        { id: 'task_2', text: 'Task 2', completed: false, createdAt: now + 1000 },
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: now }
      ];
      TaskModule.init(mockContainer);

      TaskModule.sortTasks('creation');

      const firstTaskText = mockContainer.children[0].querySelector('.task-text').textContent;
      expect(firstTaskText).toBe('Task 1');
    });

    it('should handle invalid sort criteria', () => {
      TaskModule.addTask('Task 1');
      const originalTasks = TaskModule.getTasks();

      TaskModule.sortTasks('invalid');

      const tasks = TaskModule.getTasks();
      expect(tasks).toEqual(originalTasks);
    });
  });

  describe('DOM rendering', () => {
    beforeEach(() => {
      TaskModule.init(mockContainer);
    });

    it('should render task with checkbox', () => {
      TaskModule.addTask('Test task');

      const checkbox = mockContainer.querySelector('.task-checkbox');
      expect(checkbox).not.toBeNull();
      expect(checkbox.type).toBe('checkbox');
    });

    it('should render task with text', () => {
      TaskModule.addTask('Test task');

      const textSpan = mockContainer.querySelector('.task-text');
      expect(textSpan).not.toBeNull();
      expect(textSpan.textContent).toBe('Test task');
    });

    it('should render task with edit button', () => {
      TaskModule.addTask('Test task');

      const editButton = mockContainer.querySelector('.task-edit-btn');
      expect(editButton).not.toBeNull();
      expect(editButton.textContent).toBe('Edit');
    });

    it('should render task with delete button', () => {
      TaskModule.addTask('Test task');

      const deleteButton = mockContainer.querySelector('.task-delete-btn');
      expect(deleteButton).not.toBeNull();
      expect(deleteButton.textContent).toBe('Delete');
    });

    it('should apply completed class to completed tasks', () => {
      TaskModule.addTask('Test task');
      const taskId = storedTasks[0].id;
      TaskModule.toggleComplete(taskId);

      const taskElement = mockContainer.querySelector(`[data-task-id="${taskId}"]`);
      expect(taskElement.classList.contains('task-completed')).toBe(true);
    });

    it('should check checkbox for completed tasks', () => {
      TaskModule.addTask('Test task');
      const taskId = storedTasks[0].id;
      TaskModule.toggleComplete(taskId);

      const checkbox = mockContainer.querySelector('.task-checkbox');
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      TaskModule.init(mockContainer);
    });

    it('should handle complete workflow: add, edit, toggle, delete', () => {
      // Add task
      TaskModule.addTask('Original task');
      expect(storedTasks).toHaveLength(1);

      const taskId = storedTasks[0].id;

      // Edit task
      TaskModule.editTask(taskId, 'Updated task');
      expect(storedTasks[0].text).toBe('Updated task');

      // Toggle complete
      TaskModule.toggleComplete(taskId);
      expect(storedTasks[0].completed).toBe(true);

      // Delete task
      TaskModule.deleteTask(taskId);
      expect(storedTasks).toHaveLength(0);
    });

    it('should handle multiple tasks independently', () => {
      TaskModule.addTask('Task 1');
      TaskModule.addTask('Task 2');
      TaskModule.addTask('Task 3');

      const task2Id = storedTasks[1].id;

      // Edit task 2
      TaskModule.editTask(task2Id, 'Updated Task 2');
      expect(storedTasks[1].text).toBe('Updated Task 2');

      // Toggle task 2
      TaskModule.toggleComplete(task2Id);
      expect(storedTasks[1].completed).toBe(true);

      // Verify other tasks unchanged
      expect(storedTasks[0].text).toBe('Task 1');
      expect(storedTasks[0].completed).toBe(false);
      expect(storedTasks[2].text).toBe('Task 3');
      expect(storedTasks[2].completed).toBe(false);
    });

    it('should persist tasks across re-initialization', () => {
      TaskModule.addTask('Task 1');
      TaskModule.addTask('Task 2');

      // Re-initialize module
      TaskModule.init(mockContainer);

      const tasks = TaskModule.getTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].text).toBe('Task 1');
      expect(tasks[1].text).toBe('Task 2');
    });
  });
});
