const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'suggestions',
    execute(client) {
        client.on('messageCreate', async (message) => {
            if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

            const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'suggest') {
                if (args.length === 0) return message.reply('Please provide a suggestion.');

                const suggestionText = args.join(' ');
                const suggestionChannel = client.channels.cache.get('CHANNEL_ID'); // Replace with your actual channel ID

                if (!suggestionChannel) return message.reply('Suggestion channel not found.');

                const embed = new EmbedBuilder()
                    .setTitle('New Suggestion')
                    .setDescription(suggestionText)
                    .setFooter({ text: `Suggested by ${message.author.tag}` })
                    .setColor('Blue')
                    .setTimestamp();

                try {
                    const sentMsg = await suggestionChannel.send({ embeds: [embed] });
                    await sentMsg.react('👍');
                    await sentMsg.react('👎');

                    await message.delete(); // Delete user command message

                    const confirmationMsg = await message.channel.send(`${message.author.username}, your suggestion has been posted!`);
                    setTimeout(() => confirmationMsg.delete().catch(() => {}), 5000); // auto delete after 5 seconds
                } catch (err) {
                    console.error('Failed to post suggestion:', err);
                    await message.channel.send(`${message.author.username}, there was an error posting your suggestion.`);
                }
            }
        });
    }
};
