const Octokit = require("@octokit/rest");
const Discord = require('discord.js');
const AsciiTable = require('ascii-table');
const config = require('config');
const octokit = Octokit({
    auth: config.get('github.token'),
    userAgent: 'MultiCrew Bot'
});

module.exports = {
    name: 'todo',
    description: 'Interact with GitHub Projects',
    help: false,
    execute(message, args) {
        if(args.length) {
            switch(args[0]) {
                case 'add':
                    addItem(message, args)
                case 'list':
                    listItems(message, args)
            }
        }
    }
}

// Adds a card to the To Do column of the project
function addItem(message, args) {
    const mtc = message.guild.emojis.find(emoji => emoji.name === "mtc");
    var project = 0;
    var embed = new Discord.RichEmbed()
        .setTitle('Create To-Do Card')
        .setDescription(`React to this message with ${mtc} to create a card on the copilot project or \:robot: to create a card on the bot project`)
    message.channel.send(embed).then(function (msg) {
        msg.react(mtc).then(() => msg.react('🤖'))
        const filter = (reaction, user) => {
            return user.id === message.author.id};
        msg.awaitReactions(filter, {max: 1, time: 10000})
            .then(collected => {
                const reaction = collected.first();
                switch (reaction.emoji.name) {
                    case 'mtc':
                        project = 'Copilot';
                        break;
                    case '🤖':
                        project = 'Bot';
                        break;
                }
                embed = new Discord.RichEmbed()
                    .setTitle('Create To-Do Card')
                    .setDescription('You have selected to add a card in the ' + project + ' project. You now have 30 seconds to input your card content.');
                msg.channel.send(embed).then(() => {
                    const filter = response => {
                        return response.author.id === message.author.id
                    }
                    msg.channel.awaitMessages(filter, {max: 1, time: 30000})
                        .then(collected => {
                            if (project == 'Copilot') {
                            octokit.projects.createCard({
                                column_id: 7168504,
                                note: collected.first().content
                            })
                            } else if (project == 'Bot') {
                                octokit.projects.createCard({
                                    column_id: 7227594,
                                    note: collected.first().content
                                })
                            }
                            embed = new Discord.RichEmbed()
                            .setTitle('Create To-Do Card')
                            .setDescription('A card has been created under the ' + project + ' project, it contained the following information: ```' + collected.first().content + '```');
                            message.channel.send(embed);
                        })
                })
            })
            .catch(console.error);
    });

}

// List all cards under the To-Do column
function listItems(message, args) {
    const mtc = message.guild.emojis.find(emoji => emoji.name === "mtc");
    var project = 0;
    var embed = new Discord.RichEmbed()
        .setTitle('List To-Do Cards')
        .setDescription(`React to this message with ${mtc} to list all cards on the copilot project or \:robot: to list all cards on the bot project`)
    message.channel.send(embed).then(function (msg) {
        msg.react(mtc).then(() => msg.react('🤖'))
        const filter = (reaction, user) => {
            return user.id === message.author.id};
        msg.awaitReactions(filter, {max: 1, time: 10000})
            .then(async function(collected) {
                const reaction = collected.first();
                switch (reaction.emoji.name) {
                    case 'mtc':
                        project = 'Copilot';
                        break;
                    case '🤖':
                        project = 'Bot';
                        break;
                }
                var cards = [];
                if (project == 'Copilot') {
                    cards = await octokit.projects.listCards({
                        column_id: 7168504
                })
                } else if (project == 'Bot') {
                    cards = await octokit.projects.listCards({
                        column_id: 7227594
                    })
                }
                embed = await new Discord.RichEmbed()
                    .setTitle('List To-Do Cards')
                    .setDescription('Below are a list of cards under the ' + project + ' project.')
                    .addBlankField()
                    cards.data.forEach(card => {
                        embed.addField('Card ID: ' + card.id + '.', 'Card Content: ' + card.note + '.')
                    })
                console.log(embed)    
                await message.channel.send(embed);
            })
            .catch(console.error);
    });
}