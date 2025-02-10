import { Schema, model } from 'mongoose';

interface IGuildSettings {
    guildId: string;
    startMonth: string; // Когда стартовал бот
    lastResetMonth: string; // Последний месяц сброса золота
    allowedChannelId?: string;
}

const guildSettingsSchema = new Schema<IGuildSettings>({
    guildId: { type: String, required: true, unique: true },
    startMonth: { type: String, required: true },
    lastResetMonth: { type: String, required: true },
    allowedChannelId: { type: String },
});

export const GuildSettingsModel = model<IGuildSettings>('GuildSettings', guildSettingsSchema);
