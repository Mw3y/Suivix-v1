const Config = require('../utils/Config');
const Discord = require("discord.js");

/**
 * @Returns {Discord.RichEmbed} - The default style message of the bot
 */
const setupDefaultEmbed = function () {
    return new Discord.MessageEmbed();
}

/**
 * convert a number of minutes in a number of miliseconds
 * @param minutes - The number of minutes
 * @returns {Number} - The number of miliseconds
 */
const convertMinutesInMiliseconds = function (minutes) {
    return minutes * 60000;
};


/**
 * convert a number of hours in a number of miliseconds
 * @param hours - The number of hours
 * @returns {Number} - The number of miliseconds
 */
const convertHoursInMiliseconds = function (hours) {
    return this.convertMinutesInMiliseconds(hours * 60);
};


/**
 * convert a number of milliseconds in a number of minutes
 * @param miliseconds - The number of milliseconds
 * @returns {Number} - The number of minutes
 */
const convertMillisecondsInMinutes = function (milliseconds) {
    return Math.round(milliseconds / 60000);
};

const generateDate = function () {
    var currentDate = new Date();

    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();

    var hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    if(minutes < 10) minutes = "0" + minutes;

    var finalDate = "**" + date + "/" + (month + 1) + "/" + year + "** à **" + hours + "h" + minutes + "min**";

    return finalDate;
};


/**
 * generate a random number
 * @param min - The minimal Value
 * @param max - The maximal Value
 * @returns {Number} - A random Number
 */
const generateRandomNumber = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
};


/**
 * return a string containing a proper display of a duration
 * @param {Number} minutes - The number of minutes to display
 * @returns {String} - The  string to display
 */
const displayDuration = function (minutes) {
    let heures = 0;
    let display = "";
    while (minutes >= 60) {
        heures++;
        minutes -= 60;
    }
    if (heures > 0)
        display += heures + " H ";
    display += minutes + " Min";
    if (heures == 0 && minutes == 0)
        display = "Quelques secondes...";
    return display
};


//Exports
module.exports.setupDefaultEmbed = setupDefaultEmbed;
module.exports.generateDate = generateDate;
module.exports.convertHoursInMiliseconds = convertHoursInMiliseconds;
module.exports.convertMinutesInMiliseconds = convertMinutesInMiliseconds;
module.exports.convertMillisecondsInMinutes = convertMillisecondsInMinutes;
module.exports.displayDuration = displayDuration;
module.exports.generateRandomNumber = generateRandomNumber;
