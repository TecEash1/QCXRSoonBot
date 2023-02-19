const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Lets you report players.'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('myModal')
            .setTitle('Report');
        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel("reason")
            .setStyle(TextInputStyle.Short);
        const person = new TextInputBuilder()
            .setCustomId('name')
            .setLabel("State the player name, send a video if needed")
            .setStyle(TextInputStyle.Paragraph);
        const firstActionRow = new ActionRowBuilder().addComponents(reason);
        const secondActionRow = new ActionRowBuilder().addComponents(person);
        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    },
};
