import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { UserModel } from '../models/User.js';

export const statsCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('stats')
            .setDescription('Статистика')
            .addSubcommand(sub => sub.setName('all').setDescription('Все пользователи'))
            .addSubcommand(sub => sub.setName('mine').setDescription('Моя статистика'))
            .addSubcommand(sub => sub.setName('custom').setDescription('Стата по месяцам')),

        async execute(interaction: ChatInputCommandInteraction) {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'all') {
                const users = await UserModel.find();
                const stats = users.map(u => `<@${u.discordId}>: ${u.gold}`).join('\n');
                return interaction.reply(`📊 Стата за месяц:\n${stats}`);
            } else if (subcommand === 'mine') {
                const user = await UserModel.findOne({ discordId: interaction.user.id });
                if (!user) {
                    return interaction.reply('❌ Ты бэмж. По тебе ещё нет данных.');
                }
                return interaction.reply(`📊 Моё золото: **${user.gold}**`);
            } else if (subcommand === 'custom') {
                const users = await UserModel.find();

                // Собираем все месяцы из всех пользователей
                const allMonths = new Set<string>();
                users.forEach(user => {
                    user.history.forEach(entry => {
                        allMonths.add(entry.month);
                    });
                });

                let months = Array.from(allMonths);
                // Сортируем по убыванию: новее -> старее
                months.sort((a, b) => {
                    const [aYear, aMonth] = a.split('-').map(Number);
                    const [bYear, bMonth] = b.split('-').map(Number);
                    if (aYear !== bYear) return bYear - aYear;
                    return bMonth - aMonth;
                });

                // Оставляем максимум 12 месяцев
                months = months.slice(0, 12);

                if (months.length < 2) {
                    return interaction.reply('❌ Недостаточно данных для выбора месяца (нужно минимум 2 месяца данных).');
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

                const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

                await interaction.reply({ content: '🔧 Выбери месяц:', components: [row] });
            }
        },
    },
];
