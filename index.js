// 주요 클래스 가져오기
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Routes,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const fs = require("fs");
const path = require("path");
const queue = new Map();
const log = new Map();
const { token, clientId, guildId } = require("./config.json");

// 클라이언트 객체 생성 (Guilds관련, 메시지관련 인텐트 추가)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(token);

module.exports = { queue, log };

// Add Commands
const commands = [];
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// 명령어 주입
rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);

// 봇이 준비됐을때 한번만 표시할 메시지
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 메세지 저장
client.on("messageCreate", (message) => {
  if (message.author.bot) return false;

  if (!log[message.channelId]) {
    log[message.channelId] = [];
  }
  log[message.channelId].push({
    author: message.author.username,
    content: message.content,
  });
});

// 명령어 실행
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error, "error");
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// 봇 실행
client.login(token);
