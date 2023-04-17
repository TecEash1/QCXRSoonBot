const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios').default;
const { OPENAI_API_KEY } = require('../../../config.json');

// Map of guild IDs to user ID to chat session info
const chatSessions = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('craftyai')
    .setDescription('Chat with CraftyAI')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Open or close a chat session')
        .setRequired(true)
        .addChoice('Open', 'open')
        .addChoice('Close', 'close')
    ),

  async execute(interaction) {
    const { guild, user, channel } = interaction;
    const guildId = guild.id;
    const userId = user.id;
    const action = interaction.options.getString('action');

    // Initialize the chat session map for the guild if it doesn't exist
    if (!chatSessions.has(guildId)) {
      chatSessions.set(guildId, new Map());
    }

    const userSessions = chatSessions.get(guildId);

    if (action === 'open') {
      if (userSessions.has(userId)) {
        return interaction.reply({
          content: 'You already have an open chat session. Please close it before starting a new one with /chatgpt close',
          ephemeral: true,
        });
      }

      userSessions.set(userId, {
        channelId: channel.id,
        dmChannelId: null,
        open: true,
      });

      await interaction.reply({
        content: 'Your chat session with CraftyAi (powered by OpenAi's models) has started. Please check your DMs.',
        ephemeral: true,
      });

      const dmChannel = await user.createDM();
      userSessions.set(userId, {
        ...userSessions.get(userId),
        dmChannelId: dmChannel.id,
      });

      await dmChannel.send({
        content: 'Hi! I am CraftyAI (chatgpt), a language model trained by OpenAI. My knowledge set has been enhanced by my devs! I can chat with you about almost anything. Type anything to start chatting with me!',
      });

      const filter = message => !message.author.bot;
      const session = userSessions.get(userId);

      const chatLoop = async () => {
        try {
          const collected = await session.dmChannel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
          const message = collected.first().content;

          if (message.toLowerCase() === '/chatgpt close') {
            userSessions.delete(userId);
            return session.dmChannel.send({
              content: 'Your chat session with ChatGPT has ended. Thank you for chatting!',
            });
          }

          const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: `${message}\nA:`,
            max_tokens: 150,
            n: 1,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
          });

          const answer = response.data.choices[0].text.trim();
          session.dmChannel.send({
            content: answer,
          });

          chatLoop();
        } catch (error) {
          console.error(error);
          session.dmChannel.send({
            content: 'An error occurred while processing your request. Please try again later.',
    });
  chatSessions.delete(user.id);
 }
};   chatLoop();
} else if (action === 'close') {
  if (!chatSessions.has(user.id)) {
    return interaction.reply({
      content: 'You do not have an open chat session. Please start one with /chatgpt open',
      ephemeral: true,
    });
  }

  const session = chatSessions.get(user.id);
  session.open = false;
  chatSessions.set(user.id, session);
  return interaction.reply({
    content: 'Your chat session with ChatGPT has ended. Thank you for chatting!',
    ephemeral: true,
  });
}

