import {
    SlashCommandBuilder,
    ChannelType,
    MessageFlags,
} from 'discord.js';
import { prisma } from '../lib/prisma.js'

export const channelCommand = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Установить канал для команд золота')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Выбери канал')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const channel = interaction.options.getChannel('channel', true);

        const now = new Date();
        const monthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;

        const existing = await prisma.guildSettings.findUnique({ where: { guildId } });

        if (existing) {
            await prisma.guildSettings.update({
                where: { guildId },
                data: { allowedChannelId: channel.id },
            });
        } else {
            await prisma.guildSettings.create({
                data: {
                    guildId,
                    allowedChannelId: channel.id,
                    startMonth: monthStr,
                    lastResetMonth: monthStr,
                },
            });
        }

        return interaction.reply({
            content: `✅ Команды теперь доступны только в канале <#${channel.id}>`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
