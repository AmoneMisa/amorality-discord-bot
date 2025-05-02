import { SlashCommandBuilder } from 'discord.js';
import { prisma } from '../lib/prisma.js'

export const startCommand = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Запустить отслеживание золота на этом сервере'),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;

        const existing = await prisma.guildSettings.findUnique({
            where: { guildId },
        });

        if (existing) {
            return interaction.reply('❗ Отслеживание уже запущено на этом сервере.');
        }

        await prisma.guildSettings.create({
            data: {
                guildId,
                startMonth: monthStr,
                lastResetMonth: monthStr,
            },
        });

        return interaction.reply('✅ Отслеживание золота успешно запущено!');
    },
};
