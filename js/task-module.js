/**
 * Task Module
 * Feature: todo-list-life-dashboard
 * 
 * Complete task management system with CRUD operations and persistence.
 * Provides functionality to add, edit, delete, toggle completion, and sort tasks.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 
 *               5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4
 */

/**
 * Task Module Factory
 * Creates a task module instance with the provided storage manager
 * 
 * @param {Object} storageManager - Storage Manager instance for persistence
 * @returns {Object} Public API for task management
 */
const createTaskModule = function(storageManager) {
  // Private state
  let tasks = [];
  let containerElement = null;

  /**
   * Generate unique task ID
   * Format: task_${timestamp}_${random}
   * @returns {string} Unique task identifier
   */
  function generateId() {
    return `task_${Date.now()}_${Math.random()}`;
  }

  /**
   * Validate task text input
   * @param {string} text - Task text to validate
   * @returns {string|null} Trimmed text if valid, null if invalid
   */
  function validateTaskText(text) {
    if (typeof text !== 'string') {
      return null;
    }

    const trimmed = text.trim();

    // Check non-empty
    if (trimmed.length === 0) {
      return null;
    }

    // Check max length (500 characters)
    if (trimmed.length > 500) {
      return null;
    }

    return trimmed;
  }

  /**
   * Find task by ID
   * @param {string} id - Task ID to find
   * @returns {Object|null} Task object if found, null otherwise
   */
  function findTaskById(id) {
    return tasks.find(task => task.id === id) || null;
  }

  /**
   * Render all tasks in the DOM
   */
  function render() {
    if (!containerElement) {
      console.error('[TaskModule] Container element not initialized');
      return;
    }

    // Clear existing content
    containerElement.innerHTML = '';

    // Render each task
    tasks.forEach(task => {
      renderTask(task);
    });
  }

  /**
   * Render a single task in the DOM
   * @param {Object} task - Task object to render
   */
  function renderTask(task) {
    if (!containerElement) {
      return;
    }

    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.taskId = task.id;

    // Apply completed styling
    if (task.completed) {
      taskElement.classList.add('task-completed');
    }

    // Checkbox for completion toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark task as complete');

    // Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    // Edit button
    const editButton = document.createElement('button');
    editButton.className = 'task-edit-btn';
    editButton.textContent = 'Edit';
    editButton.setAttribute('aria-label', 'Edit task');

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', 'Delete task');

    // Assemble task element
    taskElement.appendChild(checkbox);
    taskElement.appendChild(textSpan);
    taskElement.appendChild(editButton);
    taskElement.appendChild(deleteButton);

    // Event listeners
    checkbox.addEventListener('change', () => {
      toggleComplete(task.id);
    });

    editButton.addEventListener('click', () => {
      enterEditMode(task.id);
    });

    deleteButton.addEventListener('click', () => {
      deleteTask(task.id);
    });

    containerElement.appendChild(taskElement);
  }

  /**
   * Enter edit mode for a task
   * @param {string} id - Task ID to edit
   */
  function enterEditMode(id) {
    const task = findTaskById(id);
    if (!task) {
      return;
    }

    const taskElement = containerElement.querySelector(`[data-task-id="${id}"]`);
    if (!taskElement) {
      return;
    }

    // Replace text span with input field
    const textSpan = taskElement.querySelector('.task-text');
    const editButton = taskElement.querySelector('.task-edit-btn');
    const deleteButton = taskElement.querySelector('.task-delete-btn');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.text;
    input.maxLength = 500;

    const saveButton = document.createElement('button');
    saveButton.className = 'task-save-btn';
    saveButton.textContent = 'Save';
    saveButton.setAttribute('aria-label', 'Save changes');

    const cancelButton = document.createElement('button');
    cancelButton.className = 'task-cancel-btn';
    cancelButton.textContent = 'Cancel';
    cancelButton.setAttribute('aria-label', 'Cancel editing');

    // Replace elements
    textSpan.replaceWith(input);
    editButton.replaceWith(saveButton);
    deleteButton.replaceWith(cancelButton);

    // Focus input
    input.focus();
    input.select();

    // Save handler
    const saveEdit = () => {
      const newText = input.value;
      if (editTask(id, newText)) {
        // Success - render will be called by editTask
      } else {
        // Validation failed - restore original
        exitEditMode(id, task.text);
      }
    };

    // Cancel handler
    const cancelEdit = () => {
      exitEditMode(id, task.text);
    };

    // Event listeners
    saveButton.addEventListener('click', saveEdit);
    cancelButton.addEventListener('click', cancelEdit);

    // Enter key saves
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
  }

  /**
   * Exit edit mode and restore original display
   * @param {string} id - Task ID
   * @param {string} originalText - Original task text to restore
   */
  function exitEditMode(id, originalText) {
    const task = findTaskById(id);
    if (!task) {
      return;
    }

    // Re-render the task to restore normal view
    const taskElement = containerElement.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      const index = Array.from(containerElement.children).indexOf(taskElement);
      taskElement.remove();
      
      // Re-render at same position
      const tempContainer = document.createElement('div');
      containerElement.insertBefore(tempContainer, containerElement.children[index]);
      renderTask(task);
      tempContainer.remove();
    }
  }

  // Public API

  /**
   * Initialize the task module
   * @param {HTMLElement} container - DOM element to render tasks into
   */
  function init(container) {
    if (!container) {
      console.error('[TaskModule] Invalid container element');
      return;
    }

    containerElement = container;
    tasks = storageManager.getTasks();
    render();
  }

  /**
   * Add a new task
   * @param {string} text - Task text
   * @returns {boolean} True if task was added, false if validation failed
   */
  function addTask(text) {
    const validatedText = validateTaskText(text);
    
    if (!validatedText) {
      console.warn('[TaskModule] Invalid task text');
      return false;
    }

    const newTask = {
      id: generateId(),
      text: validatedText,
      completed: false,
      createdAt: Date.now()
    };

    tasks.push(newTask);

    // Save to storage
    if (!storageManager.saveTasks(tasks)) {
      console.error('[TaskModule] Failed to save tasks');
      // Rollback
      tasks.pop();
      return false;
    }

    // Render the new task
    renderTask(newTask);

    return true;
  }

  /**
   * Edit an existing task
   * @param {string} id - Task ID
   * @param {string} newText - New task text
   * @returns {boolean} True if task was edited, false if validation failed or task not found
   */
  function editTask(id, newText) {
    const task = findTaskById(id);
    
    if (!task) {
      console.warn('[TaskModule] Task not found:', id);
      return false;
    }

    const validatedText = validateTaskText(newText);
    
    if (!validatedText) {
      console.warn('[TaskModule] Invalid task text');
      return false;
    }

    // Store original text for rollback
    const originalText = task.text;
    
    // Update task
    task.text = validatedText;

    // Save to storage
    if (!storageManager.saveTasks(tasks)) {
      console.error('[TaskModule] Failed to save tasks');
      // Rollback
      task.text = originalText;
      return false;
    }

    // Re-render all tasks to update display
    render();

    return true;
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {boolean} True if task was deleted, false if task not found
   */
  function deleteTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      console.warn('[TaskModule] Task not found:', id);
      return false;
    }

    // Store removed task for rollback
    const removedTask = tasks[taskIndex];
    
    // Remove task
    tasks.splice(taskIndex, 1);

    // Save to storage
    if (!storageManager.saveTasks(tasks)) {
      console.error('[TaskModule] Failed to save tasks');
      // Rollback
      tasks.splice(taskIndex, 0, removedTask);
      return false;
    }

    // Remove from DOM
    const taskElement = containerElement.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      taskElement.remove();
    }

    return true;
  }

  /**
   * Toggle task completion status
   * @param {string} id - Task ID
   * @returns {boolean} True if task was toggled, false if task not found
   */
  function toggleComplete(id) {
    const task = findTaskById(id);
    
    if (!task) {
      console.warn('[TaskModule] Task not found:', id);
      return false;
    }

    // Store original state for rollback
    const originalState = task.completed;
    
    // Toggle completion
    task.completed = !task.completed;

    // Save to storage
    if (!storageManager.saveTasks(tasks)) {
      console.error('[TaskModule] Failed to save tasks');
      // Rollback
      task.completed = originalState;
      return false;
    }

    // Update DOM element styling
    const taskElement = containerElement.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      if (task.completed) {
        taskElement.classList.add('task-completed');
      } else {
        taskElement.classList.remove('task-completed');
      }
    }

    return true;
  }

  /**
   * Get all tasks
   * @returns {Array<Object>} Array of task objects
   */
  function getTasks() {
    return [...tasks]; // Return copy to prevent external modification
  }

  /**
   * Sort tasks by specified criteria (optional challenge feature)
   * @param {string} criteria - Sort criteria: 'creation' or 'completion'
   */
  function sortTasks(criteria) {
    if (criteria === 'creation') {
      // Sort by creation time (oldest first)
      tasks.sort((a, b) => a.createdAt - b.createdAt);
    } else if (criteria === 'completion') {
      // Sort by completion status (incomplete first)
      tasks.sort((a, b) => {
        if (a.completed === b.completed) {
          return a.createdAt - b.createdAt; // Maintain creation order within groups
        }
        return a.completed ? 1 : -1; // Incomplete tasks first
      });
    } else {
      console.warn('[TaskModule] Invalid sort criteria:', criteria);
      return;
    }

    // Save sorted order
    storageManager.saveTasks(tasks);

    // Re-render
    render();
  }

  // Return public API
  return {
    init,
    addTask,
    editTask,
    deleteTask,
    toggleComplete,
    getTasks,
    sortTasks
  };
})(typeof StorageManager !== 'undefined' ? StorageManager : null);

export default TaskModule;
