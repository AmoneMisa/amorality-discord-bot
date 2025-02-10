import { GuildSettingsModel } from './models/GuildSettings.js';
import { UserModel } from './models/User.js';

export async function checkAndResetMonthlyGold(guildId: string) {
    const settings = await GuildSettingsModel.findOne({ guildId });
    if (!settings) {
        return;
    } // ещё не стартовали на сервере

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

    if (settings.lastResetMonth !== currentMonth) {
        // Новый месяц — делаем сброс
        const users = await UserModel.find();

        for (const user of users) {
            user.history.push({ month: settings.lastResetMonth, gold: user.gold });
            user.gold = 0;
            await user.save();
        }

        settings.lastResetMonth = currentMonth;
        await settings.save();
        console.log(`✅ Gold reset for new month: ${currentMonth}`);
    }
}
