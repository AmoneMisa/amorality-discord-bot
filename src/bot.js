import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    Collection,
    MessageFlags,
} from 'discord.js';
import dotenv from 'dotenv';
import { goldCommands } from './commands/gold.js';
import { statsCommands } from './commands/stats.js';
import { startCommand } from './commands/start.js';
import { channelCommand } from './commands/channel.js';
import { prisma } from './lib/prisma.js';
import {checkAndResetMonthlyGold} from "./checkAndResetMonthlyGold.js";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

const commands = [
    ...goldCommands,
    ...statsCommands,
    startCommand,
    channelCommand,
];

commands.forEach(cmd => client.commands.set(cmd.data.name, cmd));

client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    await checkAndResetMonthlyGold(process.env.GUILD_ID);
    console.log('✅ Check gold on start finished');
});

client.on('interactionCreate', async (interaction) => {
    try {
        // 🎯 Обработка select меню
        if (interaction.isStringSelectMenu() && interaction.customId === 'select-month') {
            const selectedMonth = interaction.values[0];
            const users = await prisma.user.findMany({
                include: { history: true }
            });

            const stats = users.map(user => {
                const monthData = user.history.find(h => h.month === selectedMonth);
                if (monthData) {
                    return `<@${user.discordId}>: ${monthData.gold} золота`;
                } else {
                    return `<@${user.discordId}>: нет данных`;
                }
            }).join('\n');

            return interaction.update({
                content: `📊 Стата за **${selectedMonth}**:\n${stats}`,
                components: [],
            });
        }

        // 🛠 Slash команды
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        if (interaction.isRepliable()) {
            interaction.reply({
                content: '❌ Произошла ошибка.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

async function registerSlashCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands.map(cmd => cmd.data.toJSON()) }
        );

        console.log('✅ Slash команды зарегистрированы');
    } catch (e) {
        console.error(e);
    }
}

async function startBot() {
    await registerSlashCommands();
    await client.login(process.env.DISCORD_TOKEN);
}

await startBot();
