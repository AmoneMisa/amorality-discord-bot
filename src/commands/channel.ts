import {ChannelType, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {GuildSettingsModel} from '../models/GuildSettings.js';

export const channelCommand = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Set the allowed channel for gold commands')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select a channel')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel', true);

        const now = new Date();
        const monthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;

        await GuildSettingsModel.findOneAndUpdate(
            { guildId: interaction.guildId },
            {
                $set: { allowedChannelId: channel.id },
                $setOnInsert: {
                    startMonth: monthStr,
                    lastResetMonth: monthStr,
                    guildId: interaction.guildId
                },
            },
            { upsert: true, new: true }
        );

        return interaction.reply({content: `✅ Commands will now only work in <#${channel.id}>`, flags: MessageFlags.Ephemeral});
    },
};
