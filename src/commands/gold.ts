import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {UserModel} from '../models/User.js';
import {GuildSettingsModel} from '../models/GuildSettings.js';
import {checkAndResetMonthlyGold} from "../checkAndResetMonthlyGold";

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
                            .setDescription('Количество золота для добавления')
                            .setRequired(true)
                            .addChoices(...goldOptions.map(opt => ({ name: opt, value: opt }))),
                    ),
            )
            .addSubcommand(sub =>
                sub.setName('rm')
                    .setDescription('Уменьшить количество золота')
                    .addStringOption(option =>
                        option.setName('amount')
                            .setDescription('Количество золота для списания')
                            .setRequired(true)
                            .addChoices(...goldOptions.map(opt => ({ name: opt, value: opt }))),
                    ),
            ),
        async execute(interaction: ChatInputCommandInteraction) {
            const subcommand = interaction.options.getSubcommand();
            const amount = parseInt(interaction.options.getString('amount') || '0', 10);

            const settings = await GuildSettingsModel.findOne({ guildId: interaction.guildId });
            if (settings?.allowedChannelId && interaction.channelId !== settings.allowedChannelId) {
                return interaction.reply({ content: '❌ Commands are not allowed in this channel.', flags: MessageFlags.Ephemeral});
            }

            await checkAndResetMonthlyGold(interaction.guildId!);

            const user = await UserModel.findOneAndUpdate(
                { discordId: interaction.user.id },
                {},
                { upsert: true, new: true }
            );

            if (subcommand === 'add') {
                user.gold += amount;
            } else if (subcommand === 'rm') {
                user.gold = Math.max(0, user.gold - amount);
            }

            await user.save();
            return interaction.reply(`✅ Твоё золото: **${user.gold}**`);
        },
    },
];
