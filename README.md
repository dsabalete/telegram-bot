# Telegram Transmission Bot

A Node.js Telegram bot for managing Transmission torrents on a Raspberry Pi. Provides remote control of your downloads, system monitoring, and automatic notifications when downloads complete.

## Features

- 📋 **List torrents** - View all active, downloading, or paused torrents with progress
- ⏸️ **Pause/Resume** - Control individual torrents by ID
- ➕ **Add torrents** - Add new torrents via magnet links
- 📊 **System status** - Monitor CPU load, memory usage, and disk space
- 🔔 **Automatic notifications** - Get notified when torrents finish downloading
- 🔒 **Access control** - Single authorized chat ID for security

## Prerequisites

- Node.js (CommonJS environment)
- Transmission daemon running on `localhost:9091`
- Telegram bot token from [@BotFather](https://t.me/botfather)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
export TG_BOT_TOKEN="your_telegram_bot_token_here"
```

4. Configure your authorized chat ID:
   - Edit `bot.js` and set `AUTHORIZED_CHAT_ID` to your Telegram chat ID
   - Find your chat ID by messaging [@userinfobot](https://t.me/userinfobot)

5. (Optional) Configure HTTP links for downloaded files:
   - Edit `BASE_URL` in `bot.js` to match your HTTP server
   - Edit `BASE_DIR` to match your download directory
   - Uncomment the commented section in `checkFinishedTorrents()` to include file links in notifications

## Usage

Start the bot:
```bash
node bot.js
```

The bot will run in polling mode, automatically checking for completed torrents every 30 seconds.

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Initialize bot and display welcome message | `/start` |
| `/help` | Display all available commands | `/help` |
| `/torrents` | List all torrents (max 10) with status and progress | `/torrents` |
| `/pause <id>` | Pause a specific torrent by ID | `/pause 1` |
| `/resume <id>` | Resume a paused torrent by ID | `/resume 1` |
| `/add <magnet_url>` | Add a new torrent using a magnet link | `/add magnet:?xt=...` |
| `/status` | Display system status (CPU, RAM, disk space) | `/status` |
| `/ping` | Check if the bot is running | `/ping` |

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TG_BOT_TOKEN` | Yes | Telegram bot authentication token |

### Code Configuration

Edit `bot.js` to customize:

```javascript
const AUTHORIZED_CHAT_ID = 937938391; // Your Telegram chat ID
const BASE_URL = 'http://192.168.0.25:8080'; // HTTP server for file access
const BASE_DIR = '/mnt/sda1/shared/Pelis'; // Download directory
```

### Transmission Configuration

The bot connects to Transmission at:
- **Host**: `localhost`
- **Port**: `9091`

Ensure Transmission is running and accessible at this address.

## Architecture

- **Language**: JavaScript (CommonJS)
- **Runtime**: Node.js
- **Telegram API**: `node-telegram-bot-api` (polling mode)
- **Transmission Client**: `transmission` npm package
- **Notification Interval**: 30 seconds

### Project Structure

```
telegram-bot/
├── bot.js           # Main bot application
├── package.json     # Project dependencies
├── AGENTS.md        # Guidelines for AI agents
├── .gitignore       # Git ignore rules
└── README.md        # This file
```

## Security

- **Authorization**: Only one chat ID (`AUTHORIZED_CHAT_ID`) is allowed to use the bot
- **Access Control**: Every command verifies the chat ID before execution
- **Input Validation**: Magnet links are validated before adding torrents

## Development

### Code Style

- CommonJS modules (`require()`)
- CamelCase naming for variables and functions
- UPPER_SNAKE_CASE for constants
- Callback-based async operations
- Spanish language for user-facing messages
- Emoji prefixes for visual clarity

### Dependencies

- `node-telegram-bot-api@^0.67.0` - Telegram Bot API wrapper
- `transmission@^0.4.10` - Transmission client library

## Troubleshooting

### Bot doesn't respond

1. Check if `TG_BOT_TOKEN` is set correctly
2. Verify `AUTHORIZED_CHAT_ID` matches your chat ID
3. Ensure the bot is running (`node bot.js`)
4. Check Transmission is accessible on `localhost:9091`

### Notifications not working

1. Verify `AUTHORIZED_CHAT_ID` is correct
2. Check if `notifiedTorrents` tracking is working
3. Ensure torrents are actually completing (`percentDone === 1`)

### Transmission connection errors

1. Confirm Transmission daemon is running
2. Check if Transmission RPC is enabled on port 9091
3. Verify no firewall rules blocking the connection

## License

ISC
