import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { GuildSettingsModel } from '../models/GuildSettings.js';

export const startCommand = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start tracking your gold'),

    async execute(interaction: ChatInputCommandInteraction) {
        const guildId = interaction.guildId!;
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;

        const existing = await GuildSettingsModel.findOne({ guildId });

        if (existing) {
            return interaction.reply('❗ Отслеживание уже запущено на этом сервере.');
        }

        await GuildSettingsModel.create({
            guildId,
            startMonth: monthStr,
            lastResetMonth: monthStr,
        });

        return interaction.reply('✅ Отслеживание золота успешно запущено!');
    }
};
