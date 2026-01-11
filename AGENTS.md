# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this Telegram bot repository.

## Project Overview

This is a Node.js Telegram bot written in CommonJS that interfaces with Transmission torrent client. The bot provides commands to manage torrents, check system status, and receive notifications when downloads complete.

## Build/Test/Lint Commands

```bash
# Start the bot
node bot.js

# Install dependencies
npm install

# Currently no test framework configured - tests would need to be added
npm test  # Returns "Error: no test specified"
```

## Code Style Guidelines

### File Structure
- Main entry point: `bot.js`
- Package management: `package.json` with CommonJS (`"type": "commonjs"`)
- No build process - direct Node.js execution

### Import Style
- Use `require()` for CommonJS imports
- Group imports: external libraries first, then Node.js built-ins
- Example:
```javascript
const TelegramBot = require('node-telegram-bot-api');
const Transmission = require('transmission');
const os = require('os');
const { exec } = require('child_process');
```

### Naming Conventions
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `AUTHORIZED_CHAT_ID`, `BASE_URL`)
- **Variables**: `camelCase` (e.g., `transmission`, `magnetLink`)
- **Functions**: `camelCase` (e.g., `checkFinishedTorrents`, `buildHttpLink`)
- **Event handlers**: Use descriptive names with context (e.g., `bot.onText(/\/start/, ...)`)

### Error Handling
- Use callback-based error handling (first parameter pattern)
- Always check for errors and provide user feedback
- Log errors to console for debugging
- Example:
```javascript
transmission.get((err, result) => {
  if (err) {
    console.error('Error conectando con Transmission:', err);
    bot.sendMessage(msg.chat.id, '❌ Error conectando con Transmission');
    return;
  }
  // Continue with result
});
```

### Message Formatting
- Use emoji prefixes for visual clarity (🤖, 📋, ❌, ✅, etc.)
- Spanish language for user-facing messages
- Template literals with trim() for multi-line messages
- Example:
```javascript
bot.sendMessage(
  msg.chat.id,
  `
📋 Comandos disponibles:
/torrents - Listado de torrents activos
/pause <id> - Pausar torrent <id>
`.trim()
);
```

### Security
- Authorization check at start of every command handler
- Use hardcoded `AUTHORIZED_CHAT_ID` for access control
- Early return pattern for unauthorized access
- Example:
```javascript
if (msg.chat.id !== AUTHORIZED_CHAT_ID) {
  bot.sendMessage(msg.chat.id, '⛔ Acceso no autorizado');
  return;
}
```

### Async Operations
- Use callbacks (not promises) for consistency with existing codebase
- Handle both success and error cases
- Provide user feedback for long-running operations

### Code Organization
- Command handlers grouped by functionality
- Utility functions at bottom of file
- Constants defined at top
- Initialization code follows constants

### Comments
- Minimal comments - code should be self-documenting
- Use comments only for complex logic or TODOs
- Spanish comments for user-facing context

### Dependencies
- `node-telegram-bot-api`: Telegram bot framework
- `transmission`: Transmission client library
- No development dependencies currently

## Environment Variables
- `TG_BOT_TOKEN`: Required for Telegram bot authentication

## Development Notes
- Bot runs in polling mode
- Transmission client connects to localhost:9091
- 30-second interval for checking completed torrents
- Maximum 10 torrents displayed to avoid message limits
- File path encoding for HTTP links uses `encodeURIComponent`

## Testing
No test framework currently configured. Consider adding:
- Unit tests for utility functions
- Integration tests for command handlers
- Mock Transmission API for testing