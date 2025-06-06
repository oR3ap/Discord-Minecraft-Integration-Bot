// modules/player-lookup.js
const { Events, EmbedBuilder } = require('discord.js');
const https = require('https');

module.exports = {
    name: 'player-lookup',
    execute(client) {
        client.on(Events.MessageCreate, async (message) => {
            if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

            const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'mcinfo') {
                const username = args[0];
                if (!username) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Missing Username')
                        .setDescription('Please provide a Minecraft username.\nExample: `-mcinfo Dream`')
                        .setColor('Red')
                        .setFooter({ text: 'YOUR_SERVER_NAME' });
                    return message.reply({ embeds: [errorEmbed] });
                }

                const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;

                https.get(url, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 204 || !data) {
                            const notFoundEmbed = new EmbedBuilder()
                                .setTitle('❌ Player Not Found')
                                .setDescription(`The username \`${username}\` does not exist or is not a premium Minecraft account.`)
                                .setColor('Red')
                                .setFooter({ text: 'YOUR_SERVER_NAME' });
                            return message.reply({ embeds: [notFoundEmbed] });
                        }

                        try {
                            const player = JSON.parse(data);
                            const uuid = player.id;
                            const skinUrl = `https://api.mineatar.io/body/full/${uuid}`;
                            const avatarUrl = `https://api.mineatar.io/face/${uuid}`;
                            const embed = new EmbedBuilder()
                                .setTitle(`🔍 Minecraft Info: ${player.name}`)
                                .setThumbnail(avatarUrl)
                                .setImage(skinUrl)
                                .setColor('Green')
                                .addFields(
                                    { name: 'UUID', value: `\`${uuid}\`` },
                                    { name: 'Skin Preview', value: `[Click to view](${skinUrl})`, inline: true },
                                    { name: 'NameMC Profile', value: `[View Profile](https://namemc.com/profile/${uuid})`, inline: true }
                                )
                                .setFooter({ text: 'YOUR_SERVER_NAME' });

                            message.channel.send({ embeds: [embed] });
                        } catch (err) {
                            console.error('Failed to parse Mojang response:', err);
                            const errorEmbed = new EmbedBuilder()
                                .setTitle('❌ Error')
                                .setDescription('An error occurred while fetching the player data.')
                                .setColor('Red')
                                .setFooter({ text: 'YOUR_SERVER_NAME' });
                            message.reply({ embeds: [errorEmbed] });
                        }
                    });
                }).on('error', err => {
                    console.error('HTTP request error:', err);
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ HTTP Error')
                        .setDescription('Failed to contact Mojang API.')
                        .setColor('Red')
                        .setFooter({ text: 'YOUR_SERVER_NAME' });
                    message.reply({ embeds: [errorEmbed] });
                });
            }
        });
    }
};
