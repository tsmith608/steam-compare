const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { checkTierAccess } = require('../utils/tierCheck');

const API_BASE = 'https://webothplay.com';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compare')
        .setDescription('Compare games between yourself and other users')
        .addUserOption(option => option.setName('user1').setDescription('First user to compare with'))
        .addUserOption(option => option.setName('user2').setDescription('Second user to compare with'))
        .addUserOption(option => option.setName('user3').setDescription('Third user to compare with'))
        .addChannelOption(option =>
            option.setName('voice')
                .setDescription('Compare with everyone in this voice channel')
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        // 0. Check Tier Access
        const access = await checkTierAccess(interaction, 'Noob'); // We don't block compare, just scale it
        const executorTier = access.currentTier;

        const tierLimits = { 'Noob': 3, 'Pro': 6, 'Hacker': 12 };
        const maxUsers = tierLimits[executorTier] || 3;

        // 1. Collect all users involved (Self + mentions + voice)
        const targets = [interaction.user];
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');
        const u3 = interaction.options.getUser('user3');
        let voiceChannel = interaction.options.getChannel('voice');

        // Auto-detect voice if no specific users/channel provided (and user is in a VC)
        if (!u1 && !u2 && !u3 && !voiceChannel) {
            const member = interaction.member;
            if (member && member.voice.channel) {
                voiceChannel = member.voice.channel;
            }
        }

        if (u1) targets.push(u1);
        if (u2) targets.push(u2);
        if (u3) targets.push(u3);

        if (voiceChannel) {
            if (executorTier === 'Noob' && !access.isServerPerk) {
                return interaction.editReply({
                    content: `❌ **Voice Channel Comparison** is a **Pro** tier feature.\n\nType \`/upgrade\` to unlock it, or have a **Hacker** tier member join your server!`,
                });
            }
            // Need GuildVoiceStates intent for this to work reliably
            voiceChannel.members.forEach(member => {
                if (!member.user.bot) {
                    targets.push(member.user);
                }
            });
        }

        // Remove duplicates
        const uniqueUsers = [...new Map(targets.map(u => [u.id, u])).values()];

        if (uniqueUsers.length > maxUsers) {
            return interaction.editReply({
                content: `❌ Your **${executorTier}** tier is limited to comparing **${maxUsers} users**.\n\nYou tried to compare ${uniqueUsers.length} users.\n\nType \`/upgrade\` to increase your limit!`,
            });
        }

        // 2. Resolve Steam IDs via valid API
        const resolved = [];
        const missing = [];

        for (const user of uniqueUsers) {
            try {
                // Fetch from our local API
                const res = await fetch(`${API_BASE}/api/discord/link?discord_id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.steamId) {
                        resolved.push({ user, steamId: data.steamId });
                    } else {
                        missing.push(user);
                    }
                } else {
                    missing.push(user);
                }
            } catch (err) {
                console.error(`Failed to fetch for ${user.username}:`, err);
                missing.push(user);
            }
        }

        // 3. Handle Resilience
        if (resolved.length < 2) {
            const missingNames = missing.map(u => `**${u.username}**`).join(', ');
            return interaction.editReply({
                content: `❌ I only found linked Steam accounts for **${resolved.length}** user(s).\n\nNeed at least 2 people to compare! ${missing.length > 0 ? `Missing: ${missingNames}` : ''}`,
            });
        }

        // 4. Generate Link
        const steamParams = resolved.map(r => `steamid=${r.steamId}`).join('&');
        const compareUrl = `${API_BASE}/?${steamParams}`;

        const embed = new EmbedBuilder()
            .setColor(0x60A5FA)
            .setTitle('🎮 Library Comparison')
            .setDescription(`Found Steam accounts for **${resolved.length} users**.\n[**Click here to view full comparison**](${compareUrl})`)
            .addFields(
                { name: 'Comparing', value: resolved.map(r => `• ${r.user.username}`).join('\n'), inline: true }
            )
            .setTimestamp();

        if (missing.length > 0) {
            embed.addFields({ name: '⚠️ Skipped (Not Linked)', value: missing.map(u => `• ${u.username}`).join('\n'), inline: true });
        }

        // 5. Fetch Top 10 Games (Bonus)
        try {
            const compareRes = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: resolved.map(r => r.steamId) })
            });

            if (compareRes.ok) {
                const compareData = await compareRes.json();
                const shared = compareData.shared || [];

                if (shared.length > 0) {
                    // Sort by total playtime (sum of all users)
                    const sorted = shared.map(g => {
                        const totalMinutes = Object.values(g.playtimes).reduce((a, b) => a + b, 0);
                        return { ...g, totalMinutes };
                    }).sort((a, b) => b.totalMinutes - a.totalMinutes);

                    const top10 = sorted.slice(0, 10).map((g, i) => {
                        const hours = Math.round(g.totalMinutes / 60);
                        return `${i + 1}. **${g.name}** (${hours} hrs combined)`;
                    }).join('\n');

                    embed.addFields({ name: '🏆 Top Shared Games', value: top10 });
                } else {
                    embed.addFields({ name: '🏆 Top Shared Games', value: 'No shared games found!' });
                }
            }
        } catch (err) {
            console.error("Error fetching top games:", err);
            // Fallback: just send the link if this fails
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('View Full Comparison')
                    .setStyle(ButtonStyle.Link)
                    .setURL(compareUrl)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};
