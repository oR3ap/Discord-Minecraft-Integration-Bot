// modules/botcontrol.js
const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

module.exports = {
  name: 'botcontrol',
  execute(client) {
    const storagePath = path.join(__dirname, 'configs', 'storage.yml');
    let storage = { hasJoined: false };

    if (fs.existsSync(storagePath)) {
      try {
        const file = fs.readFileSync(storagePath, 'utf8');
        storage = yaml.parse(file) || storage;
      } catch (err) {
        console.error('Error reading storage.yml:', err);
      }
    }

    let bot = null;
    let connected = false;
    let reconnectInterval = null;
    let awaitingCommandReply = false;
    let pendingDiscordMessage = null;

    const RECONNECT_DELAY = 10000;
    const CHECK_INTERVAL = 5000;
    const ADMIN_ROLE_ID = 'PUT_ID_HERE';

    function saveStorage() {
      try {
        fs.writeFileSync(storagePath, yaml.stringify(storage));
      } catch (err) {
        console.error('Error writing storage.yml:', err);
      }
    }

    function createBot() {
      if (bot) {
        try {
          bot.quit();
        } catch (e) {}
        bot = null;
      }

      console.log('🟡 Connecting to server...');
      bot = mineflayer.createBot({
        host: 'PUT_SERVER_IP_HERE',
        port: 25565,
        username: 'Bot',
      });

      bot.once('spawn', () => {
        connected = true;
        console.log('✅ Bot spawned and connected.');

        try {
          if (!storage.hasJoined) {
            bot.chat('/register Aintcrackin1253 Aintcrackin1253');
            storage.hasJoined = true;
            saveStorage();
          } else {
            bot.chat('/login Aintcrackin1253');
          }
        } catch (err) {
          console.error('Error during login/register:', err);
        }
      });

      bot.on('message', (jsonMsg) => {
        if (awaitingCommandReply && pendingDiscordMessage) {
          const text = jsonMsg.toString().trim();
          if (text.length > 0) {
            pendingDiscordMessage.reply(`📩 **Server Reply:** ${text}`);
            awaitingCommandReply = false;
            pendingDiscordMessage = null;
          }
        }
      });

      bot.on('error', (err) => {
        connected = false;
        console.error('Bot error:', err);
      });

      bot.on('end', () => {
        connected = false;
        console.log('❌ Bot disconnected. Reconnecting in 10 seconds...');
        scheduleReconnect();
      });
    }

    function scheduleReconnect() {
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          if (!connected) {
            console.log('🔄 Attempting reconnect...');
            createBot();
          }
        }, RECONNECT_DELAY);
      }
    }

    function startDiscordCommandListener() {
      client.on('messageCreate', async (message) => {
        if (!message.content.startsWith(client.config.prefix)) return;
        if (message.author.bot) return;

        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'botcontrol') {
          if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('You do not have permission to use this command.');
          }

          if (!bot || !connected || !bot.player) {
            return message.reply('⚠️ Bot is not connected to the Minecraft server.');
          }

          if (args.length === 0) {
            return message.reply('Please provide a command for the bot to execute.');
          }

          const mcCommand = args.join(' ');
          bot.chat(`/${mcCommand}`);

          awaitingCommandReply = true;
          pendingDiscordMessage = message;

          setTimeout(() => {
            if (awaitingCommandReply && pendingDiscordMessage) {
              pendingDiscordMessage.reply('⚠️ No reply from server.');
              awaitingCommandReply = false;
              pendingDiscordMessage = null;
            }
          }, 5000);
        }
      });
    }

    createBot();
    scheduleReconnect();
    startDiscordCommandListener();
  }
};
