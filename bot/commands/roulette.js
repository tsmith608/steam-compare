const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');
const { API_BASE, resolveSteamIds } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Randomly pick a game to play from your shared library')
        .addUserOption(option => option.setName('user1').setDescription('First user'))
        .addUserOption(option => option.setName('user2').setDescription('Second user'))
        .addChannelOption(option =>
            option.setName('voice')
                .setDescription('Use voice channel')
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Pro');
        if (!access.allowed) {
            return interaction.editReply({ content: access.reason, components: access.components || [] });
        }

        const targets = [interaction.user];
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');
        const voiceChannel = interaction.options.getChannel('voice');

        if (u1) targets.push(u1);
        if (u2) targets.push(u2);
        if (voiceChannel) {
            voiceChannel.members.forEach(member => {
                if (!member.user.bot) targets.push(member.user);
            });
        }

        const uniqueUsers = [...new Map(targets.map(u => [u.id, u])).values()];
        const discordIds = uniqueUsers.map(u => u.id);

        const links = await resolveSteamIds(discordIds);
        const resolved = links.map(l => ({
            user: uniqueUsers.find(u => u.id === l.discordId),
            steamId: l.steamId
        })).filter(r => r.user);

        if (resolved.length < 1) {
            return interaction.editReply({ content: '❌ No linked users found! Use `/link` first.' });
        }

        const steamIds = resolved.map(r => r.steamId);
        await this._spinAndReply(interaction, steamIds, false);
    },

    // Shared spin logic for both initial command and button re-spins
    async _spinAndReply(interaction, steamIds, isUpdate) {
        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: steamIds })
            });

            if (!compareRes.ok) throw new Error("API Error");
            const data = await compareRes.json();

            let pool = data.shared || [];

            // If single user, use their owned games
            if (steamIds.length === 1 && data.unique && data.unique[steamIds[0]]) {
                const userPool = data.unique[steamIds[0]];
                if (userPool.length > 0) pool = userPool;
            }

            if (pool.length === 0) {
                const msg = '❌ No games found to pick from! Is your Steam profile private?';
                return isUpdate ? interaction.editReply({ content: msg }) : interaction.editReply({ content: msg });
            }

            const randomGame = pool[Math.floor(Math.random() * pool.length)];

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🎰 The Roulette Spun...')
                .setDescription(`And landed on:\n# **${randomGame.name}**`)
                .setImage(`https://cdn.cloudflare.steamstatic.com/steam/apps/${randomGame.appid}/header.jpg`)
                .setFooter({ text: `Picked from ${pool.length} games.` })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`roulette:spin:${steamIds.join(',')}`)
                        .setLabel('🔄 Spin Again')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel('🚀 Launch in Steam')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`steam://run/${randomGame.appid}`)
                );

            if (isUpdate) {
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.editReply({ embeds: [embed], components: [row] });
            }

        } catch (err) {
            console.error("Roulette error:", err);
            const msg = `❌ Failed to spin the roulette: ${err.message}`;
            if (isUpdate) {
                await interaction.reply({ content: msg, ephemeral: true });
            } else {
                await interaction.editReply({ content: msg });
            }
        }
    },

    async handleButton(interaction, action) {
        const [actionName, steamIdsStr] = action.split(':');
        if (actionName === 'spin') {
            const steamIds = steamIdsStr.split(',');
            await this._spinAndReply(interaction, steamIds, true);
        }
    },
};
