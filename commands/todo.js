const Octokit = require("@octokit/rest");
const { oauthLoginUrl } = require("@octokit/oauth-login-url");
const Discord = require('discord.js');
const config = require('config');

const secret = config.get('github.secret');

const octokit = new Octokit({
    auth: secret,
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
                    break;
                case 'list':
                    listItems(message)
                    break;
                case 'delete':
                    deleteItem(message, args)
                    break;
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
function listItems(message) {
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
                    cards.data.forEach(card => {
                        embed.addField('Card ID: ' + card.id, 'Card Content: ' + card.note + '.')
                    }) 
                await message.channel.send(embed);
            })
            .catch(console.error);
    });
}

// Delete a to do card
function deleteItem(message, args) {
    const mtc = message.guild.emojis.find(emoji => emoji.name === "mtc");
    var project = 0;
    var embed = new Discord.RichEmbed()
        .setTitle('Delete a To-Do Card')
        .setDescription(`React to this message with ${mtc} to select the copilot project or \:robot: to select the bot project`)
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
                embed = new Discord.RichEmbed()
                    .setTitle('Delete a To-Do Card')
                    .setDescription('You have chosen the ' + project + ' project. Below are all the To-Do cards in that project, you have 30 seconds to input the Card ID to delete the card.')
                    cards.data.forEach(card => {
                        embed.addField('Card ID: ' + card.id, 'Card Content: ' + card.note + '.')
                    }) 
                msg.channel.send(embed).then(() => {
                    const filter = response => {
                        return response.author.id === message.author.id
                    }
                    msg.channel.awaitMessages(filter, {max: 1, time: 30000})
                        .then(async function(collected) {
                            let card;
                            card = await octokit.projects.getCard({
                                card_id: collected.first().content
                            })
                            embed = new Discord.RichEmbed()
                                .setTitle('Delete a To-Do Card Confirmation')
                                .setDescription('You have selected card ' + card.data.id + ', containing the following content: ' + card.data.note + '. You have 10 seconds to react to this message with ✅ to confirm or ❎ to cancel.')
                            msg.channel.send(embed).then(function (m) {
                                m.react('✅').then(() => m.react('❎'))
                                const filter = (reaction, user) => {
                                    return user.id === message.author.id};
                                m.awaitReactions(filter, {max: 1, time: 10000})
                                    .then(async function(collected) {
                                        const reaction = collected.first();
                                        if(reaction.emoji.name == '✅'){
                                            octokit.projects.deleteCard({
                                                card_id: card.data.id
                                            })
                                            embed = new Discord.RichEmbed()
                                                .setTitle('Delete a To-Do Card Confirmation')
                                                .setDescription('To-Do Card deleted')
                                            msg.channel.send(embed)
                                        } else if (reaction.emoji.name == '❎') {
                                            embed = new Discord.RichEmbed()
                                                .setTitle('Cancelled')
                                                .setDescription('You have cancelled deleting a To-Do Card.')
                                            msg.channel.send(embed)
                                        }
                                    })
                            })
                        });
                })
            })
            .catch(console.error);
    });
}