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
    adminRoleId: '1317990180300263426',
    supportRoleId: '1317990180283744327',
    reviewChannelId: '1376229214541447288',
    transcriptChannelId: '1376231043572564149',
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
