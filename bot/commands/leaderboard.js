const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { resolveSteamIds, getRankings } = require('../utils/api');

const PAGE_SIZE = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See who is the biggest gamer in the server!')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Ranking category')
                .addChoices(
                    { name: 'Playtime (2 Weeks)', value: 'playtime' },
                    { name: 'Library Size', value: 'library' }
                )),
    async execute(interaction) {
        await interaction.deferReply();
        const category = interaction.options.getString('category') || 'playtime';

        // 1. Robust Guild Resolution
        let guild = interaction.guild;
        if (!guild && interaction.guildId) {
            try {
                guild = await interaction.client.guilds.fetch(interaction.guildId);
            } catch (e) {
                console.error("Failed to fetch guild:", e);
            }
        }

        if (!guild) {
            return interaction.editReply({ content: "❌ This command can only be used in a server." });
        }

        try {
            // 2. Check Tier Access
            const access = await checkTierAccess(interaction, 'Pro');
            if (!access.allowed) {
                return interaction.editReply({ content: access.reason, components: access.components || [] });
            }

            // 3. Fetch linked members
            let members;
            try {
                members = await guild.members.fetch({ limit: 1000 }).catch(() => guild.members.cache);
            } catch (err) {
                console.warn("Member fetch failed, falling back to cache:", err);
                members = guild.members.cache;
            }

            const discordIds = members.filter(m => !m.user.bot).map(m => m.id);

            if (discordIds.length === 0) {
                return interaction.editReply({ content: "❌ No members found in this server." });
            }

            const links = await resolveSteamIds(discordIds);
            const steamIds = links.map(l => l.steamId);

            if (steamIds.length === 0) {
                return interaction.editReply({ content: "❌ No linked accounts found in this server. Use `/link` to connect!" });
            }

            // 4. Fetch Rankings
            const stats = await getRankings(steamIds);

            // Map stats back to Discord users
            const rankData = stats.map(s => {
                const link = links.find(l => l.steamId === s.steamid);
                if (!link) return null;
                const member = members.get(link.discordId);
                return {
                    name: member ? member.displayName : 'Linked User',
                    ...s
                };
            }).filter(Boolean);

            if (rankData.length === 0) {
                return interaction.editReply({ content: "❌ No ranking data available for linked members." });
            }

            // Sort
            if (category === 'playtime') {
                rankData.sort((a, b) => (b.recentMinutes || 0) - (a.recentMinutes || 0));
            } else {
                rankData.sort((a, b) => (b.librarySize || 0) - (a.librarySize || 0));
            }

            // Build page 0
            const embed = this._buildPageEmbed(rankData, category, guild, 0);
            const row = this._buildPageRow(rankData.length, category, 0);
            const selectRow = this._buildCategorySelect(category);

            const components = [selectRow];
            if (row) components.push(row);

            await interaction.editReply({ embeds: [embed], components });

        } catch (err) {
            console.error("Leaderboard error detail:", err);
            try {
                const msg = `❌ Failed to generate leaderboard: ${err.message}`;
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: msg });
                } else {
                    await interaction.reply({ content: msg, ephemeral: true });
                }
            } catch (replyErr) {
                console.error("Failed to send error reply:", replyErr);
            }
        }
    },

    _buildPageEmbed(rankData, category, guild, page) {
        const start = page * PAGE_SIZE;
        const pageData = rankData.slice(start, start + PAGE_SIZE);
        const totalPages = Math.ceil(rankData.length / PAGE_SIZE);

        const title = category === 'playtime' ? '⏳ Playtime Rankings (Last 2 Weeks)' : '📚 Library Size Rankings';

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`🏆 Server Leaderboard: ${guild.name}`)
            .setDescription(`**${title}**\n*Showing ${rankData.length} linked members*`)
            .setThumbnail(guild.iconURL())
            .setTimestamp();

        const description = pageData.map((u, i) => {
            const rank = start + i;
            const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`;
            const val = category === 'playtime'
                ? `${((u.recentMinutes || 0) / 60).toFixed(1)}h`
                : `${u.librarySize || 0} games`;
            return `${medal} **${u.name}**: ${val}`;
        }).join('\n');

        embed.addFields({ name: 'Rankings', value: description || "No data available." });

        if (totalPages > 1) {
            embed.setFooter({ text: `Page ${page + 1} of ${totalPages}` });
        }

        return embed;
    },

    _buildPageRow(totalItems, category, page) {
        const totalPages = Math.ceil(totalItems / PAGE_SIZE);
        if (totalPages <= 1) return null;

        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`leaderboard:prev:${category}:${page}`)
                    .setLabel('⬅️ Prev')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId(`leaderboard:next:${category}:${page}`)
                    .setLabel('➡️ Next')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1)
            );
    },

    _buildCategorySelect(currentCategory) {
        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('leaderboard:category')
                    .setPlaceholder('Change ranking category...')
                    .addOptions(
                        { label: 'Playtime (2 Weeks)', value: 'playtime', emoji: '⏳', default: currentCategory === 'playtime' },
                        { label: 'Library Size', value: 'library', emoji: '📚', default: currentCategory === 'library' }
                    )
            );
    },

    async handleButton(interaction, action) {
        const [actionName, category, pageStr] = action.split(':');
        const currentPage = parseInt(pageStr);

        const newPage = actionName === 'next' ? currentPage + 1 : currentPage - 1;

        await interaction.deferUpdate();

        // Re-fetch data
        const guild = interaction.guild;
        if (!guild) return;

        try {
            let members;
            try {
                members = await guild.members.fetch({ limit: 1000 }).catch(() => guild.members.cache);
            } catch { members = guild.members.cache; }

            const discordIds = members.filter(m => !m.user.bot).map(m => m.id);
            const links = await resolveSteamIds(discordIds);
            const steamIds = links.map(l => l.steamId);
            const stats = await getRankings(steamIds);

            const rankData = stats.map(s => {
                const link = links.find(l => l.steamId === s.steamid);
                if (!link) return null;
                const member = members.get(link.discordId);
                return { name: member ? member.displayName : 'Linked User', ...s };
            }).filter(Boolean);

            if (category === 'playtime') {
                rankData.sort((a, b) => (b.recentMinutes || 0) - (a.recentMinutes || 0));
            } else {
                rankData.sort((a, b) => (b.librarySize || 0) - (a.librarySize || 0));
            }

            const embed = this._buildPageEmbed(rankData, category, guild, newPage);
            const row = this._buildPageRow(rankData.length, category, newPage);
            const selectRow = this._buildCategorySelect(category);

            const components = [selectRow];
            if (row) components.push(row);

            await interaction.editReply({ embeds: [embed], components });

        } catch (err) {
            console.error("Leaderboard pagination error:", err);
        }
    },

    async handleSelect(interaction, action) {
        if (action === 'category') {
            await interaction.deferUpdate();
            const newCategory = interaction.values[0];
            const guild = interaction.guild;
            if (!guild) return;

            try {
                let members;
                try {
                    members = await guild.members.fetch({ limit: 1000 }).catch(() => guild.members.cache);
                } catch { members = guild.members.cache; }

                const discordIds = members.filter(m => !m.user.bot).map(m => m.id);
                const links = await resolveSteamIds(discordIds);
                const steamIds = links.map(l => l.steamId);
                const stats = await getRankings(steamIds);

                const rankData = stats.map(s => {
                    const link = links.find(l => l.steamId === s.steamid);
                    if (!link) return null;
                    const member = members.get(link.discordId);
                    return { name: member ? member.displayName : 'Linked User', ...s };
                }).filter(Boolean);

                if (newCategory === 'playtime') {
                    rankData.sort((a, b) => (b.recentMinutes || 0) - (a.recentMinutes || 0));
                } else {
                    rankData.sort((a, b) => (b.librarySize || 0) - (a.librarySize || 0));
                }

                const embed = this._buildPageEmbed(rankData, newCategory, guild, 0);
                const row = this._buildPageRow(rankData.length, newCategory, 0);
                const selectRow = this._buildCategorySelect(newCategory);

                const components = [selectRow];
                if (row) components.push(row);

                await interaction.editReply({ embeds: [embed], components });

            } catch (err) {
                console.error("Leaderboard category switch error:", err);
            }
        }
    },
};
