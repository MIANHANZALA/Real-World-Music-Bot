const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { distubeOptions } = require('./src/config/config.js');
const fs = require('fs');
const path = require('path');
const PlayerManager = require('./src/player/PlayerManager.js');
const { printWatermark } = require('./src/config/type.js');
const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessages
];

const client = new Client({ intents });
printWatermark();
client.commands = new Collection();
client.playerManager = new PlayerManager(client, distubeOptions);
client.playerManager.distube.setMaxListeners(20);
const commandsPath = path.join(__dirname, './src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}


const eventsPath = path.join(__dirname, './src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}


const express = require("express");
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, "0.0.0.0", () => {
    console.log(`Web server running on port ${port}`);
});

// Discord connection monitoring

client.once("ready", () => {
    console.log("================================");
    console.log(`✅ BOT ONLINE: ${client.user.tag}`);
    console.log(`✅ Connected to ${client.guilds.cache.size} server(s)`);
    console.log("================================");
});

client.on("error", error => {
    console.error("Discord Client Error:", error);
});

client.on("shardError", error => {
    console.error("Discord Gateway Error:", error);
});

const token = process.env.TOKEN?.trim();

if (!token) {
    console.error("❌ Discord TOKEN is missing!");
    process.exit(1);
}

client.login(token).catch(error => {
    console.error("❌ Discord Login Failed:", error);
    process.exit(1);
});
