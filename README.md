# 💬🎮 Discord-Minecraft-Integration-Bot

A powerful yet easy-to-use Discord bot that integrates **Minecraft server control**, **ticketing**, **suggestions**, and more — all from your Discord server.

---

## 🚀 Features

- 🎟️ **Ticket System** – Easy support ticket creation and management  
- 💡 **Suggestions** – Organized suggestion collection with voting  
- 🧱 **Minecraft Integration** – Run Minecraft commands directly from Discord  
- 🔍 **Player Lookup** – Retrieve player data from the Minecraft server  
- 🛡️ **Anti-Crash Detection** – Automatically detect and respond to suspicious activity  
- 🔐 **Role-based Access** – Secure command access with role checks  
- 🔄 **Auto Reconnect** – Minecraft bot reconnects automatically on disconnect  
- 🛠️ **Modular Structure** – Easily add, remove, or configure modules

---

## 🛠️ Setup Instructions

> ⚠️ **Important:** All role IDs, server name, channel IDs, and other configuration values must be updated in:  
> - `modules/botcontrol.js`, `tickets.js`, `suggestions.js`, `player-lookup.js`, `antiCrash.js`  
> - `index.js`

### 1. 🔧 Configuration

Ensure you have updated:
- Role IDs (e.g., `1374783520026787881`)
- Channel IDs
- Minecraft server information in `botcontrol.js`
- Other module-specific settings

### 2. 🔐 Environment Setup

Make sure `.env` exists in the root directory:

```
TOKEN=your_discord_bot_token
```

> Keep this token secure and never share it.

### 3. 📦 Install Dependencies

```bash
npm install
```

### 4. ▶️ Start the Bot

```bash
node index.js
```

---

## ⚙️ Discord Developer Portal Settings

Make sure the following intents are enabled for your bot:

- ✅ **MESSAGE CONTENT INTENT**
- ✅ **SERVER MEMBERS INTENT**
- ✅ **PRESENCE INTENT**

You can enable these at: [https://discord.com/developers/applications](https://discord.com/developers/applications)

---

## 📁 Folder Structure

```
├── modules/
│   ├── botcontrol.js
│   ├── tickets.js
│   ├── suggestions.js
│   ├── player-lookup.js
│   └── antiCrash.js
├── .env
├── index.js
├── README.md
```

---

## ✅ Required Permissions

Ensure the bot has the following permissions:
- Read Messages
- Send Messages
- Embed Links
- Manage Roles (for ticket system)
- Access to required channels

---

## 💬 Support

Need help? Found a bug? Reach out through your preferred support channel.