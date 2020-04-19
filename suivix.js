const Discord = require("discord.js");
const client = new Discord.Client();
const Config = require('./modules/utils/Config');
const CommandReader = require('./modules/CommandReader');
const CommandTable = require('./modules/CommandTable');
let commandReader = new CommandReader();

/**
 * Will be executed whenever the bot has started
 */
client.on("ready", () => {
  console.log("####################\n\n\nDémarrage de Suivix\n\n\n####################");
  client.user.setStatus('available')
  client.user.setPresence({
      game: {
          name: 'behance.net/mw3y',
          type: "WATCHING",
          url: "https://behance.net/mw3y"
      }
  });
});

/**
 * Will be executed each time the bot recieve a message
 */
client.on("message", (message) => {
  //check if the user is a bot before doing anything
  if (message.author.bot) return;
    commandReader.handleMessage(message, client);

});

client.on("messageReactionAdd", (reaction, user) => {
      
});

client.login(Config.DISCORD_CLIENT_TOKEN);
