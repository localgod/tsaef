# Development Container Setup

This project is configured to use VS Code Dev Containers for a consistent development environment.

## Quick Start

1. **Open in Dev Container**: 
   - Install the "Dev Containers" extension in VS Code if you haven't already
   - Open this project in VS Code
   - Click the green remote indicator in the bottom left corner
   - Select "Reopen in Container"

2. **Automatic Setup**:
   - The dev container will automatically:
     - Install Node.js 20 (LTS)
     - Install project dependencies via `npm install`
     - Set up Git integration
     - Install VS Code extensions for GitHub Copilot, GitHub integration, and TypeScript support

## Features

### Extensions Included
- **GitHub Copilot** - AI-powered code completion
- **GitHub Copilot Chat** - Interactive AI assistant in VS Code
- **GitHub Actions** - GitHub Actions workflow support
- **GitHub Pull Requests and Issues** - Native GitHub integration
- **TypeScript** - Latest TypeScript language support
- **Vitest Explorer** - Visual test runner

### Development Commands

Inside the container:
```bash
npm run build       # Compile TypeScript
npm run dev         # Watch mode compilation
npm run test        # Run tests with Vitest
npm test:run        # Run tests once
npm test:coverage   # Generate coverage report
npm run lint        # Run linting with oxlint
npm run lintfix     # Auto-fix linting issues
npm run format      # Check formatting with oxfmt
npm run formatfix   # Auto-fix formatting
```

## Requirements

- Docker or Docker Desktop (must be running)
- VS Code with the "Dev Containers" extension
- ~500MB of disk space for the container

## Using Claude and GitHub in the Container

Since you're running inside the container, you have full access to:
- **Claude (GitHub Copilot Chat)**: Use the Copilot Chat interface just like in your local development
- **GitHub**: Authenticate with GitHub using the built-in GitHub integration, or use your existing credentials if mounted

All git operations and GitHub interactions work seamlessly within the container.

## Rebuilding the Container

If you update dependencies or need to rebuild:
1. Click the remote indicator in the bottom left
2. Select "Rebuild Container"

Or use the command palette: `Dev Containers: Rebuild Container`

## Troubleshooting

- **Dependencies not installed**: The container automatically runs `npm install` after creation
- **TypeScript not recognizing modules**: The container uses the workspace TypeScript version
- **Extensions not loading**: They're installed automatically; reload the window if needed
