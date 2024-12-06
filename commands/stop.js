const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("모든 음악재생을 중지합니다."),
  async execute(interaction) {
    const { queue } = require("../index");

    if (!queue[interaction.guild.id]) {
      interaction.reply("재생목록이 없습니다.");
      return false;
    }
    interaction.reply("재생을 중지합니다.");
    const reply = await interaction.fetchReply();

    reply.react("🛑");
    queue[interaction.guild.id].player.stop();
    delete queue[interaction.guild.id];
  },
};
