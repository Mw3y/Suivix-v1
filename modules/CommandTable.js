const Ping = require('./commands/Ping');
const Suivix = require('./commands/Suivix');

const CommandTable = new Map(
    [
        ["ping", Ping.PingCommand],
        ["suivix", Suivix.suivixCommand],
    ]
);

module.exports = CommandTable;