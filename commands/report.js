const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Lets you report players.'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('myModal')
            .setTitle('My Modal');
        const name = new reason()
            .setCustomId('reason')
            .setLabel("reason")
            .setStyle(TextInputStyle.Short);
        const person = new TextInputBuilder()
            .setCustomId('name')
            .setLabel("What is the name of the player and send the video / mp3 if needed")
            .setStyle(TextInputStyle.Paragraph);
        const firstActionRow = new ActionRowBuilder().addComponents(reason);
        const secondActionRow = new ActionRowBuilder().addComponents(name);
        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    },
};
