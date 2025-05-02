import { prisma } from './lib/prisma.js'

export async function checkAndResetMonthlyGold(guildId) {
    const settings = await prisma.guildSettings.findUnique({
        where: { guildId },
    });

    if (!settings) {
        // Команда /start ещё не запускалась
        return;
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

    if (settings.lastResetMonth !== currentMonth) {
        // Новый месяц — сохраняем в историю и обнуляем золото
        const users = await prisma.user.findMany();

        const historyEntries = users.map(user => ({
            userId: user.id,
            month: settings.lastResetMonth,
            gold: user.gold,
        }));

        if (historyEntries.length > 0) {
            await prisma.history.createMany({
                data: historyEntries,
            });
        }

        await prisma.user.updateMany({
            data: { gold: 0 },
        });

        await prisma.guildSettings.update({
            where: { guildId },
            data: { lastResetMonth: currentMonth },
        });

        console.log(`✅ Gold reset for ${guildId} (${currentMonth})`);
    }
}
