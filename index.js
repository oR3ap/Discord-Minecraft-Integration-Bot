const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.commands = new Collection();
client.modules = new Collection();

client.config = {
    prefix: '-', // You are using '-' as the command prefix
    adminRoleId: 'PUT_ID_HERE',
    supportRoleId: 'PUT_ID_HERE',
    reviewChannelId: 'PUT_ID_HERE',
    transcriptChannelId: 'PUT_ID_HERE',
};

// 🔁 Dynamically load all modules from the /modules directory
const moduleFiles = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));

for (const file of moduleFiles) {
    try {
        const module = require(`./modules/${file}`);
        if (module.name && typeof module.execute === 'function') {
            client.modules.set(module.name, module);
            module.execute(client);
            console.log(`✅ Loaded module: ${module.name}`);
        } else {
            console.warn(`⚠️ Skipped loading ${file} (missing name or execute function)`);
        }
    } catch (error) {
        console.error(`❌ Failed to load module ${file}:`, error);
    }
}

// ✅ Bot ready event
client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// 🔐 Login
client.login(process.env.TOKEN);
