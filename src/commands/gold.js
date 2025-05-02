import {
    SlashCommandBuilder,
    MessageFlags,
} from 'discord.js';
import { prisma } from '../lib/prisma.js'
import { checkAndResetMonthlyGold } from '../checkAndResetMonthlyGold.js';

const goldOptions = ['1500', '3000', '10000', '20000', '50000', '100000', '200000'];

export const goldCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('gold')
            .setDescription('Управление золотом')
            .addSubcommand(sub =>
                sub.setName('add')
                    .setDescription('Добавить золото')
                    .addStringOption(option =>
                        option.setName('amount')
                            .setDescription('Сколько золота добавить')
                            .setRequired(true)
                            .addChoices(...goldOptions.map(opt => ({ name: opt, value: opt })))
                    )
            )
            .addSubcommand(sub =>
                sub.setName('rm')
                    .setDescription('Уменьшить количество золота')
                    .addStringOption(option =>
                        option.setName('amount')
                            .setDescription('Сколько золота списать')
                            .setRequired(true)
                            .addChoices(...goldOptions.map(opt => ({ name: opt, value: opt })))
                    )
            ),

        async execute(interaction) {
            const subcommand = interaction.options.getSubcommand();
            const amount = parseInt(interaction.options.getString('amount') || '0', 10);

            const guildId = interaction.guildId;
            const userId = interaction.user.id;

            const settings = await prisma.guildSettings.findUnique({ where: { guildId } });

            if (settings?.allowedChannelId && interaction.channelId !== settings.allowedChannelId) {
                return interaction.reply({
                    content: '❌ Команды можно использовать только в назначенном канале.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            await checkAndResetMonthlyGold(guildId);

            const existingUser = await prisma.user.findUnique({ where: { discordId: userId } });
            let updatedGold = existingUser?.gold ?? 0;

            if (subcommand === 'add') {
                updatedGold += amount;
            } else if (subcommand === 'rm') {
                updatedGold = Math.max(0, updatedGold - amount);
            }

            await prisma.user.upsert({
                where: { discordId: userId },
                update: { gold: updatedGold },
                create: {
                    discordId: userId,
                    gold: updatedGold,
                },
            });

            return interaction.reply(`✅ Текущее золото: **${updatedGold}**`);
        },
    },
];
