const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, getLink } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backlog')
        .setDescription('Find a random game you own but haven\'t played much')
        .addUserOption(option => option.setName('user').setDescription('User to shame (optional)')),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason, components: access.components || [] });
        }

        const steamId = await getLink(targetUser.id);
        if (!steamId) {
            return interaction.editReply({ content: `❌ ${targetUser.id === interaction.user.id ? 'You haven\'t' : targetUser.username + " hasn't"} linked a Steam account yet! Run \`/link\` to connect.` });
        }

        await this._pickAndReply(interaction, steamId, targetUser.username, false);
    },

    async _pickAndReply(interaction, steamId, username, isUpdate) {
        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: [steamId, steamId] })
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();

            let library = data.shared || [];
            if (library.length === 0 && data.unique && data.unique[steamId]) {
                library = data.unique[steamId];
            }

            // Filter for backlog: < 3 hours (180 mins)
            const backlog = library.filter(g => {
                const pt = g.playtimes ? g.playtimes[steamId] : g.playtime_forever;
                return pt < 180;
            });

            if (backlog.length === 0) {
                const msg = '🎉 Amazing! No backlog! You play everything you buy.';
                return isUpdate ? interaction.update({ content: msg, embeds: [], components: [] }) : interaction.editReply({ content: msg });
            }

            const pick = backlog[Math.floor(Math.random() * backlog.length)];
            const pt = pick.playtimes ? pick.playtimes[steamId] : pick.playtime_forever;

            const embed = new EmbedBuilder()
                .setColor(0xE74C3C)
                .setTitle('🛑 PILE OF SHAME DETECTED')
                .setDescription(`**${username}** owns **${pick.name}** but has only played it for **${pt} minutes**.\n\n*Go play it!*`)
                .setImage(`https://cdn.cloudflare.steamstatic.com/steam/apps/${pick.appid}/header.jpg`)
                .addFields({ name: '📊 Backlog Stats', value: `**${backlog.length}** unplayed games in library`, inline: true })
                .setFooter({ text: `That's ${((backlog.length / library.length) * 100).toFixed(0)}% of your library collecting dust.` })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`backlog:next:${steamId}:${username}`)
                        .setLabel('🔄 Another One')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel('🚀 Launch in Steam')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`steam://run/${pick.appid}`)
                );

            if (isUpdate) {
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.editReply({ embeds: [embed], components: [row] });
            }

        } catch (err) {
            console.error("Backlog error:", err);
            const msg = `❌ Failed to check backlog: ${err.message}`;
            if (isUpdate) {
                await interaction.reply({ content: msg, ephemeral: true });
            } else {
                await interaction.editReply({ content: msg });
            }
        }
    },

    async handleButton(interaction, action) {
        const parts = action.split(':');
        if (parts[0] === 'next') {
            const steamId = parts[1];
            const username = parts.slice(2).join(':');
            await this._pickAndReply(interaction, steamId, username, true);
        }
    },
};
