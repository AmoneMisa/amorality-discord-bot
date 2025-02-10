import { Schema, model } from 'mongoose';

interface IUser {
    discordId: string;
    gold: number;
    history: { month: string; gold: number }[];
}

const userSchema = new Schema<IUser>({
    discordId: { type: String, required: true, unique: true },
    gold: { type: Number, default: 0 },
    history: [{ month: String, gold: Number }],
});

export const UserModel = model<IUser>('User', userSchema);
