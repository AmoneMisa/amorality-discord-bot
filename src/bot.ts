import {Client, GatewayIntentBits, REST, Routes, Collection, MessageFlags} from 'discord.js';
import { config } from 'dotenv';
import { connectToDatabase } from './database.js';
import { goldCommands } from './commands/gold.js';
import { statsCommands } from './commands/stats.js';
import { startCommand } from './commands/start.js';
import { channelCommand } from './commands/channel.js';
import {UserModel} from "./models/User";

config();

interface ExtendedClient extends Client {
    commands: Collection<string, any>;
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as ExtendedClient;

client.commands = new Collection();

const commands = [
    ...goldCommands,
    ...statsCommands,
    startCommand,
    channelCommand,
];

commands.forEach(cmd => client.commands.set(cmd.data.name, cmd));

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction: any) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: '❌ There was an error.', flags: MessageFlags.Ephemeral });
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select-month') {
            const selectedMonth = interaction.values[0]; // выбранный месяц
            const users = await UserModel.find();

            const stats = users.map((user) => {
                const monthData = user.history.find(h => h.month === selectedMonth);
                if (monthData) {
                    return `${user.discordId}: ${monthData.gold} золота`;
                } else {
                    return `${user.discordId}: нет данных`;
                }
            }).join('\n');

            await interaction.update({
                content: `📊 Стата за **${selectedMonth}**:\n${stats}`,
                components: []
            });
        }
    }
});

async function registerSlashCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: [] }
        );

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: commands.map(cmd => cmd.data.toJSON()) },
        );
        console.log('✅ Slash commands registered');

    } catch (e) {
        console.error(e);
    }
}

async function startBot() {
    await connectToDatabase();
    await registerSlashCommands();
    await client.login(process.env.DISCORD_TOKEN);
}

await startBot();
