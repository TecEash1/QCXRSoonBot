const fs = require('fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Routes, Events, EmbedBuilder, ActivityType  } = require('discord.js');
const { REST } = require('@discordjs/rest');
const config = require('./config.json');
const Token = config.token;
const ClientID = config.clientID;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = [];
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    console.log(command);
    client.commands.set(command.data.name, command);
}

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

rest = new REST({version: '10'}).setToken(Token);

client.on("rateLimit", function (rateLimitData) {
    console.log(`The Rate Limit has been hit!`);
    console.log({ rateLimitData });
});

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(ClientID),
            { body: commands },
        );

        console.log(`Successfully registered application commands globally with no errors! Your slash commands are working!`);
    } catch (error) {
        console.error(error);
    }
})();
/*rest.put(Routes.applicationGuildCommands(ClientID, GuildID), { body: commands })
    .then(() => console.log('Successfully registered application commands locally with no errors! Your slash commands are working!'))
    .catch(console.error);*/

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Oof! (ERROR) Contact <@317814254336081930>!', ephemeral: true });
    }
});

client.login(Token);

client.on("ready", function () {
    console.log(`I am ready! Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        activities: [{ name: `The XRCraft Discord Server`, type: ActivityType.Watching }],
        status: 'online',
      });
});

client.once('ready', () => {
    console.log('Ready!');
});

//modal shit

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === 'myModal') {
        await interaction.reply({ content: 'Your report was received successfully!' });
    }
});

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isModalSubmit()) return;
    const name = interaction.fields.getTextInputValue('reason');
    const person = interaction.fields.getTextInputValue('name');
    console.log({ reason, name });
});