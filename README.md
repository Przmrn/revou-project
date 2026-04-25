# To-Do List Life Dashboard

A client-side web application for daily productivity featuring time display, focus timer, task management, and quick links. Built with vanilla HTML, CSS, and JavaScript following Swiss design principles.

## Features

- **Time & Greeting**: Current time display with time-based greeting messages
- **Focus Timer**: Pomodoro-style countdown timer (default 25 minutes)
- **Task Management**: Add, edit, complete, and delete tasks
- **Quick Links**: Save and access favorite websites
- **Local Storage**: All data persists in browser storage

## Project Structure

```
.
├── index.html              # Main HTML structure
├── css/
│   └── styles.css         # Styles following Swiss design principles
├── js/
│   └── app.js             # Main application logic
├── tests/
│   ├── unit/              # Unit tests
│   └── properties/        # Property-based tests
├── package.json           # Dependencies and scripts
├── vitest.config.js       # Test configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Modern browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Node.js (for development and testing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Open `index.html` in your browser to run the application.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Testing Strategy

The project uses a dual testing approach:

- **Property-Based Testing**: Using fast-check to verify universal properties across many inputs
- **Unit Testing**: Using Vitest for specific examples and edge cases
- **DOM Testing**: Using happy-dom for browser environment simulation

## Design Philosophy

The application follows Swiss design principles:

- Grid-based layouts with mathematical precision
- Asymmetric compositions for visual interest
- Generous white space as a design element
- Limited color palette (2-3 colors plus neutrals)
- Sans-serif typography for clarity
- Geometric shapes and clean lines
- Functional, objective design approach

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## License

MIT
