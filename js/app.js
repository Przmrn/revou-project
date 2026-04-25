// To-Do List Life Dashboard - Main Application
// Entry point for the application

import GreetingModule from './greeting-module.js';
import TimerModule from './timer-module.js';

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard initialized');
  
  // Initialize Greeting Module
  const greetingContainer = document.getElementById('greeting');
  if (greetingContainer) {
    GreetingModule.init(greetingContainer);
  }
  
  // Initialize Timer Module
  const timerContainer = document.getElementById('timer');
  if (timerContainer) {
    TimerModule.init(timerContainer);
  }
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    GreetingModule.cleanup();
    TimerModule.cleanup();
  });
});
