// modules/ticket.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Events, PermissionsBitField, ComponentType, InteractionType } = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    name: 'ticket',
    execute(client) {
        client.on(Events.MessageCreate, async (message) => {
            if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

            const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'ticket' && args[0] === 'setup') {
                if (!message.member.roles.cache.has(client.config.adminRoleId)) return message.reply('You do not have permission to use this command.');

                // Delete previous setup messages if any
                const fetched = await message.channel.messages.fetch({ limit: 20 });
                const botMessages = fetched.filter(m => m.author.id === client.user.id && m.embeds.length && m.embeds[0].title === '🎟️ Create a Ticket');
                for (const msg of botMessages.values()) {
                    await msg.delete().catch(() => {});
                }

                const embed = new EmbedBuilder()
                    .setTitle('🎟️ Create a Ticket')
                    .setDescription('Click a button below to open a ticket.')
                    .setImage('https://your-banner-url.com/banner.png') // Replace with your banner
                    .setColor('Blue');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_general_support').setLabel('General Support').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('ticket_bug_report').setLabel('Bug Report').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('ticket_rank_purchase').setLabel('Rank Purchase').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('ticket_other').setLabel('Other').setStyle(ButtonStyle.Primary)
                );

                await message.channel.send({ embeds: [embed], components: [row] });
            }
        });

        client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
                const category = interaction.customId.replace('ticket_', '');
                const prompts = {
                    general_support: 'Explain your issue.',
                    bug_report: 'Explain the bug.',
                    rank_purchase: 'What rank would you like to purchase?',
                    other: 'Describe your request.',
                };

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        }
                    ],
                });

                await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });

                const promptMessage = await channel.send({ content: `<@${interaction.user.id}> ${prompts[category]}` });

                const collector = channel.createMessageCollector({ filter: m => m.author.id === interaction.user.id, max: 1 });
                collector.on('collect', async (msg) => {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(msg.content)
                        .setColor('Green');

                    await msg.delete();
                    await promptMessage.delete();
                    await channel.send({ embeds: [embed] });

                    const closeBtn = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger)
                    );
                    await channel.send({ content: 'Press the button below to close this ticket.', components: [closeBtn] });
                });
            }

            if (interaction.isButton() && interaction.customId === 'close_ticket') {
                await interaction.deferUpdate();
                const channel = interaction.channel;
                const messages = await channel.messages.fetch();
                const transcript = await createTranscript(channel, { limit: -1, returnBuffer: false, fileName: `${channel.name}-transcript.html` });

                await channel.send('Ticket will be closed in 5 seconds...');
                setTimeout(async () => {
                    try {
                        const reviewButtons = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('review_1').setLabel('1 ⭐').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('review_2').setLabel('2 ⭐').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('review_3').setLabel('3 ⭐').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('review_4').setLabel('4 ⭐').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('review_5').setLabel('5 ⭐').setStyle(ButtonStyle.Secondary)
                        );

                        await interaction.user.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('⭐ Support Review')
                                    .setDescription('Please rate your support experience')
                                    .setColor('Yellow')
                            ],
                            components: [reviewButtons]
                        });

                        await interaction.user.send({ files: [transcript] });
                    } catch (err) {
                        console.warn('Could not DM user:', err);
                    }

                    await client.channels.cache.get(client.config.transcriptChannelId).send({ files: [transcript] });
                    await channel.delete();
                }, 5000);
            }

            if (interaction.isButton() && interaction.customId.startsWith('review_')) {
                const stars = interaction.customId.split('_')[1];
                const reviewEmbed = new EmbedBuilder()
                    .setTitle('📝 New Review')
                    .setDescription(`${'⭐'.repeat(parseInt(stars))} (${stars}/5)`) 
                    .setFooter({ text: `From ${interaction.user.tag}` })
                    .setColor('Blue');

                await client.channels.cache.get(client.config.reviewChannelId).send({ embeds: [reviewEmbed] });
                await interaction.reply({ content: 'Thanks for your feedback!', ephemeral: true });
            }
        });
    }
};
