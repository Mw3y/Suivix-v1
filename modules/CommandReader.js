const Config = require('./utils/Config');
const CommandTable = require('./CommandTable');

class CommandReader {

    /**
     * This function analyses the passed message and calls the associated function if there is one.
     * @param {*} message - A command posted by an user.
     * @param {*} client - The bot user in case we have to make him do things
     * @param {*} talkedRecently - The list of user that has been seen recently
     */
    async handleMessage(message, client) {
        let prefix = CommandReader.getUsedPrefix(message);
        if (prefix === "n") {
            this.traceMessage(message, client);
            //if (message.author.id != Config.BOT_OWNER_ID) return message.channel.send(":x: Le Draftbot est actuellement en maintenance: Pour plus d'infos, visitez le discord du bot http://draftbot.tk \n\n :flag_um: The bot is being updated please be patient :) ");
            launchCommand(message, client);
        } else {
            if (prefix == Config.BOT_OWNER_PREFIX && message.author.id == Config.BOT_OWNER_ID) {
                launchCommand(message, client);
            }
        }
    }


    traceMessage(message) {
        let trace = `---------\nMessage recu sur le serveur : ${message.guild.name} - id ${message.guild.id}\nAuteur du message : ${message.author.username} - id ${message.author.id}\nMessage : ${message.content}`;
        console.log(trace);
    }

    /**
     * Sanitizes the string and return the command. The command should always be the 1st argument.
     * @param {*} message - The message to extract the command from.
     * @returns {String} - The command, extracted from the message.
     */
    static getCommandFromMessage(message) {
        return CommandReader.getArgsFromMessage(message).shift().toLowerCase();
    }

    /**
     * Sanitizes the string and return the args. The 1st argument is not an args.
     * @param {*} message - The message to extract the command from.
     * @returns {string} - args, extracted from the message.
     */
    static getArgsFromMessage(message) {
        return message.content.slice(Config.PREFIXLENGTH).trim().split(/ +/g);
    }
    /**
     * Get the prefix that the user just used to make the command
     * @param {*} message - The message to extract the command from.
     */
    static getUsedPrefix(message) {
        return message.content.substr(0, 1);
    }
}

/**
 *
 * @param {*} message - A command posted by an user.
 * @param {*} client - The bot user in case we have to make him do things
 */
function launchCommand(message, client) {
    let command = CommandReader.getCommandFromMessage(message);
    let args = CommandReader.getArgsFromMessage(message);
    if (CommandTable.has(command))
            CommandTable.get(command)(message, args, client);
}

module.exports = CommandReader;
