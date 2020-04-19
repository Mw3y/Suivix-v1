const Tools = require('../utils/Tools');


/**
 * Display the ping of the bot and allow user to check if the bot is online
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message
 */
const pingCommand = async function (message) {
    let pingMessage = ":ping_pong: Pong";
    displayPing(message, pingMessage);

};


/**
 * Display the latency of the bot.
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message
 * @param pingMessage - The text used to make the answer more beautiful
 */
function displayPing(message, pingMessage) {
    message.channel.send(Tools.setupDefaultEmbed().setDescription(pingMessage)).then(msg => {
        let pingValue = calculateTimeDifferenceBetweenTwoMessages(message, msg);
        msg.edit(Tools.setupDefaultEmbed().setDescription(pingMessage + " | " + pingValue + " ms"));
    })

}


/**
 * calculate the time difference between two messages
 * @param messageOne - The first message
 * @param messageTwo - The second message
 */
function calculateTimeDifferenceBetweenTwoMessages(messageOne, messageTwo) {
    let startTime = messageOne.createdTimestamp;
    let endTime = messageTwo.createdTimestamp;
    let pingValue = endTime - startTime;
    return pingValue;
}

module.exports.PingCommand = pingCommand;