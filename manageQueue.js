const ytdl = require("@distube/ytdl-core");
const { createAudioResource } = require("@discordjs/voice");
const { queue } = require("./index");

const play = (guildId) => {
  const url = queue[guildId].playlist[0].url;
  const player = queue[guildId].player;
  const resource = createAudioResource(
    ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    })
  );

  try {
    player.play(resource);
  } catch (error) {
    console.log(error);
  }
};

const getNextResource = (guildId) => {
  if (queue[guildId]) {
    queue[guildId].playlist.shift();
    if (queue[guildId].playlist.length == 0) {
      delete queue[guildId];
    } else {
      play(guildId);
    }
  }
};

module.exports = { play, getNextResource };
