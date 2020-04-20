const Tools = require('../utils/Tools');
const Config = require('../utils/Config');

/**
 * Launch the command
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param args - arguments typed by the user in addition to the command
 * @param client - The bot instance
 */
const suivixCommand = async function (message, args, client) {
    const guild = message.guild; // The guild
    const channel = message.channel; //The channel were the command has been trigerred

    const audioChannels = Array.from(await guild.channels.cache.filter(c => c.type === "voice").values()); //The list of channels in the server / Filtered by type "voice"
    const roles = Array.from(await guild.roles.cache.values()); //The list of roles in the server

    if (audioChannels.size === 0) { //Check if there is no audio channel in the server
        generateNoValidChannelException(channel); // if no one, print an exceptions 
        return;
    }

    //Modify args so as to 1 => 0, etc... to match arrays index
    let channelNb = parseInt(args[1]) - 1;
    let roleNb = parseInt(args[2]) - 1;

    //Check if one line command is trigerred
    if (args.length > 2) {
        generateAppelMessage(message, message, channel, audioChannels[channelNb], roles[roleNb]); //continue
        return;
    }

    //Display choice messages
    await generateChannelChoiceMessage(message, channel, audioChannels, roles);
};

/**
 * Display the message to choose a channel
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param {*} channel - The channel were the command has been trigerred
 * @param {*} audioChannels - The list of voice channels
 * @param {*} roles - The list of roles
 */
async function generateChannelChoiceMessage(message, channel, audioChannels, roles) {
    let channels = "\n";
    let i = 1;
    await audioChannels.forEach(c => channels += `• n°**${i++}** - (${c.parent.name}) \`${c.name}\`\n`); //convert the channels array to text

    let msg = await channel.send(Tools.setupDefaultEmbed().setDescription(":speaking_head: | Liste des salons :\n" + //Send the message
        channels + "\n" + message.author.toString() + ", veuillez sélectionnner le salon où vous devez effectuer le suivi en tapant `nselect <numéro du salon>`\n:warning: **Vous disposez de 2min pour répondre.**"));

    const filter = m => m.author.id = message.author.id; //condition to trigger the next part of the code
    //Waiting for an answer
    message.channel.awaitMessages(filter, { max: 1, time: 120000 }).then(answer => {
        if (answer.first().author.id === message.author.id) { //checking another time
            if (answer.first().content.startsWith('nselect')) {
                var nb = answer.first().content.split(" "); //the answer (voice channel)
                if (nb[1] === undefined) { //check if the answer exists
                    channel.send(":x: | Vous devez taper `nselect <numéro>` pour sélectionner le salon où faire le suivi. Veuillez réessayer.")
                } else {
                    const parsedNb = parseInt(nb[1]); //transform the answer into int
                    generateRoleChoiceMessage(message, msg, channel, audioChannels[parsedNb - 1], roles) //continue
                }
            } else { //if answer doesn't start with "nselect"
                channel.send(":x: | Vous devez taper `nselect <numéro>` pour sélectionner le salon où faire le suivi. Veuillez réessayer.")
            }
        }
    });


};

/**
 * Display the message to choose a role
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param msg - The message to choose the voice channel
 * @param {*} channel - The channel were the command has been trigerred
 * @param {*} audioChannel - The choosen voice channel
 * @param {*} roles - The list of roles
 */
async function generateRoleChoiceMessage(message, msg, channel, audioChannel, roles) {
    let rolesString = "\n";
    let i = 1;
    await roles.forEach(r => rolesString += `• n°**${i++}** - ${r.toString()}\n`); //convert the array to text

    await msg.delete(); //delete the previous msg
    msg = await channel.send(Tools.setupDefaultEmbed().setDescription(":man_technologist: | Liste des roles :\n" + //send the message
        rolesString + "\n" + message.author.toString() + ", veuillez sélectionner le role qui correspond aux personnes dont vous voulez effectuer le suivi en tapant `nselect <numéro du role>`\n:warning: **Vous disposez de 2min pour répondre.**"));

    const filter = m => m.author.id = message.author.id; //condition to trigger the next part of the code
    //Waiting for an answer
    message.channel.awaitMessages(filter, { max: 1, time: 120000 }).then(answer => {
        if (answer.first().author === message.author) { //checking another time
            if (answer.first().content.startsWith('nselect')) {
                var nb = answer.first().content.split(" "); //the answer
                if (nb[1] === undefined) { //check if there is an answer
                    channel.send(":x: | Vous devez taper `nselect <numéro>` pour sélectionner le role correspondant aux personnes dont vous voulez effectuer le suivi. Veuillez réessayer.")
                } else {
                    let parsedNb = parseInt(nb[1]); //transform the answer into int
                    generateAppelMessage(message, msg, channel, audioChannel, roles[parsedNb - 1]) //continue
                }
            } else { //if answer doesn't start with "nselect"
                channel.send(":x: | Vous devez taper `nselect <numéro>` pour sélectionner le role correspondant aux personnes dont vous voulez effectuer le suivi. Veuillez réessayer.")
            }
        }
    });


}

/**
 * Begins the suivi
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param msg - The message to choose the role
 * @param {*} channel - The channel were the command has been trigerred
 * @param {*} audioChannel - The choosen voice channel
 * @param {*} role - The choosen role
 */
async function generateAppelMessage(message, msg, channel, audioChannel, role) {
    let introMsg = await channel.send("Le suivi va être effectué dans le salon `" + audioChannel.name + "` pour les personnes ayant le role " + role.toString());
    let user = message.guild.member(message.author);
    await doAppel(user, message.guild, channel, audioChannel, role)
    introMsg.edit("Le suivi dans le salon `" + audioChannel.name + "`" + " a été effectué.")
}

/**
 * Does the suivi
 * @param {*} user - The user who trigerred the command
 * @param {*} guild - The guild where the command has been trigerred in
 * @param {*} channel - The channel where the command has been trigerred in
 * @param {*} audioChannel - The voice channel
 * @param {*} role - The role
 */
async function doAppel(user, guild, channel, audioChannel, studentsRole) {
    let students = await guild.roles.cache.find(r => r.id === studentsRole.id).members; //fetch user with the role
    let audioChannelStudents = await audioChannel.members.filter(member => member.roles.cache.has(studentsRole.id)) //fetch users in the voice channel

    let member = guild.member(user); //transform the user into a guildMember
    let intro = `Suivi demandé par : \`${(member.displayName === user.user.username ? user.user.username : member.nickname + ` (@${user.user.username})`)}\`` +
        `\nCatégorie : \`${audioChannel.parent.name}\`\nDate : ${Tools.generateDate()} :clock1:\n\n`;

    let absentsText = "✅ Il n'y a aucun absent.\n";
    let absentUsersCollection = students.filter(x => Array.from(audioChannelStudents.values()).indexOf(x) === -1); //compare the two arrays to get absent users
    let absentUsers = Array.from(absentUsersCollection.values());
    let absentUsersName = new Array();

    let i = 0;
    await absentUsers.forEach(function (u) { absentUsersName[i] = guild.member(u).displayName; i++ })
    await absentUsersName.sort(function (a, b) { //sort users name 
        return a.localeCompare(b);
    });

    if (audioChannelStudents.size !== students.size) { //if the is some absents
        absentsText = `:warning: Liste des ${studentsRole.toString()}(s) absent(e)(s) :\n\`\`\``
        for (let i in absentUsersName) {
            let user = absentUsers.find(u => u.displayName === absentUsersName[i]);
            let member = guild.member(user);
            absentsText += "• " + (member.displayName === user.user.username ? user.user.username : member.nickname + ` (@${user.user.username})`) + "\n";
        }
        absentsText += "```";
    }

    let presentUsersCollection = students.filter(x => !absentUsers.includes(x)); //get users who are not absent
    let presentUsers = Array.from(presentUsersCollection.values());
    let presentUsersText = "";
    let presentUsersName = new Array();

    i = 0;
    await presentUsers.forEach(function (u) { presentUsersName[i] = guild.member(u).displayName; i++ })
    await presentUsersName.sort(function (a, b) { //sort users name
        return a.localeCompare(b);
    });

    if (presentUsers.length > 0) { //check if there is some present users
        presentUsersText = `\n:man: Liste des ${studentsRole.toString()}(s) présent(e)(s) :\n\`\`\``
        for (let i in presentUsersName) {
            let user = presentUsers.find(u => u.displayName === presentUsersName[i]);
            let member = guild.member(user);
            presentUsersText += "• " + (member.displayName === user.user.username ? user.user.username : member.nickname + ` (@${user.user.username})`) + "\n";
        }
        presentUsersText += "```";
    }

    let total = ":white_check_mark: Total des " + studentsRole.toString() + "(s) présent(e)(s) : `" + presentUsers.length + "/" + students.size + "`\n" +
        ":x: Total des " + studentsRole.toString() + "(s) absent(e)(s) : `" + absentUsers.length + "/" + students.size + "`\n\n";

    channel.send(Tools.setupDefaultEmbed().setTitle(`Suivi de ${audioChannel.name}`) //send result
        .setDescription(intro + total + absentsText + presentUsersText).setColor(studentsRole.color).setFooter("Bot Suivix (v2.0.3[Beta]) réalisé par MΛX#2231"));

    user.send(Tools.setupDefaultEmbed().setTitle(`Suivi de ${audioChannel.name}`) //send result in pv
        .setDescription(intro  + total.split(studentsRole.toString()).join("`@" + studentsRole.name + "`") + absentsText.split(studentsRole.toString()).join("`@" + studentsRole.name + "`") + presentUsersText.split(studentsRole.toString()).join("`@" + studentsRole.name + "`")).setColor(studentsRole.color).setFooter("Bot Suivix (v2.0.3[Beta]) réalisé par MΛX#2231"));
}

function generateNoValidChannelException(channel) {
    channel.send(Tools.setupDefaultEmbed().setDescription(":x: | Aucun salon audio valide n'a été détecté."))
};

module.exports.suivixCommand = suivixCommand;