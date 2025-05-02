import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import { prisma } from '../lib/prisma.js'

export const statsCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('stats')
            .setDescription('Статистика')
            .addSubcommand(sub => sub.setName('all').setDescription('Все пользователи'))
            .addSubcommand(sub => sub.setName('mine').setDescription('Моя статистика'))
            .addSubcommand(sub => sub.setName('custom').setDescription('Стата по месяцам')),

        async execute(interaction) {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'all') {
                const users = await prisma.user.findMany();
                const stats = users.map(u => `<@${u.discordId}>: ${u.gold}`).join('\n');
                return interaction.reply(`📊 Стата за текущий месяц:\n${stats}`);
            }

            if (subcommand === 'mine') {
                const user = await prisma.user.findUnique({
                    where: { discordId: interaction.user.id },
                });

                if (!user) {
                    return interaction.reply('❌ По тебе ещё нет данных.');
                }

                return interaction.reply(`📊 Твоё золото: **${user.gold}**`);
            }

            if (subcommand === 'custom') {
                const users = await prisma.user.findMany({
                    include: { history: true },
                });

                const allMonths = new Set();
                users.forEach(user => {
                    user.history.forEach(entry => {
                        allMonths.add(entry.month);
                    });
                });

                let months = Array.from(allMonths);

                months.sort((a, b) => {
                    const [aYear, aMonth] = a.split('-').map(Number);
                    const [bYear, bMonth] = b.split('-').map(Number);
                    if (aYear !== bYear) return bYear - aYear;
                    return bMonth - aMonth;
                });

                months = months.slice(0, 12);

                if (months.length < 2) {
                    return interaction.reply('❌ Недостаточно данных. Нужно минимум 2 месяца.');
                }

                const select = new StringSelectMenuBuilder()
                    .setCustomId('select-month')
                    .setPlaceholder('Выбери месяц')
                    .addOptions(
                        months.map(month => ({
                            label: month,
                            value: month,
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(select);

                return interaction.reply({
                    content: '🔧 Выбери месяц:',
                    components: [row],
                });
            }
        },
    },
];
