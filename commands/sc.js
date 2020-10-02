const { Command } = require('discord-akairo');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const rm = require('discord.js-reaction-menu');
require('dotenv').config();
const axios = require('axios');
const qs = require('qs');

class SCCommand extends Command {

    constructor() {
        super('sc', {
            aliases: ['sc'],
            typing: true,
            description: 'Interact with Shared Cockpit Requests',
            args: [
                {
                    id: 'type',
                    type: ['search', 'add', 'accept', 'help'],
                    default: 'help'
                }
            ]
        });
    }

    async exec(message, args) {
        const token = this.client.apiToken;
        switch (args.type) {
            case 'search':
                return this.search(message, args, token);
                break;
            case 'add':
                return this.add(message, args, token);
                break;
            case 'accept':
                return this.accept(message, args, token);
                break;
            case 'help':
                return this.help(message, args);
                break;
            default:
                return this.help(message, args);
                break;
        }
    }

    async search(message, args, token) {
        var options = 0;
        var fail = false;
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Search all Public Shared Cockpit Requests')
            .setDescription('Please enter a comma separated list of aircraft or airport ICAO codes you would like to search with.\nIf you would like to search for all public requests, just type `none`');
        message.channel.send(embed);
        message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 30000, errors: ['time']}).then(collected => {
            if (collected.first().content.toLowerCase() == 'none') {
                options = {
                    headers: {
                        'Accept':'application/json',
                        'Authorization': 'Bearer ' + token,
                    }
                };
            } else {
                const params = collected.first().content.split(/\s*,\s*/u);
                params.forEach(function(param, index) {
                    if (/^[A-Z]{4}$/i.test(param)) { // for airports
                        return params[index] = param.toUpperCase();
                    } else if (/^[A-Z]{1,}[0-9]{1,}[A-Z]?$/i.test(param)) { // for aircraft
                        return params[index] = param.toUpperCase();
                    } else {
                        fail = true;
                        const embed = new MessageEmbed()
                            .setColor('FF550B')
                            .setTitle('Search Query Error')
                            .setDescription('Your inputted search query `' + param + '` is not a valid ICAO code, to try a new search query, simply run `.sc search` again');
                        return message.reply(embed);
                    }
                });
                options = {
                    headers: {
                        'Accept':'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                    params: {'query': params},
                    paramsSerializer: params => {
                        return qs.stringify(params);
                    }
                    
                };
            }
            if (fail) {
                return;
            }
            axios.get(`${process.env.REQUEST_URL}api/search`, options)
            .then(function(response) {
                if (typeof response.data == 'object') {
                    response.data = Object.values(response.data);
                }
                if(response.data.length > 0) {
                    const pagesArray = [];
                    response.data.forEach(request => {
                        if (request.departure && request.departure.length > 1) {
                            request.departure = request.departure.join('/');
                        }
                        if (request.arrival && request.arrival.length > 1) {
                            request.arrival = request.arrival.join('/');
                        }
                        if (request.departure == null) {
                            request.departure = 'N/A';
                        }
                        if (request.arrival == null) {
                            request.arrival = 'N/A';
                        }
                        const attachment = new MessageAttachment('./assets/icon.png', 'icon.png');
                        const embed = new MessageEmbed()
                            .setColor('FF550B')
                            .setTitle(`Request ID: ${request.id}`)
                            .setAuthor(`Created by: ${request.requestee.username}`)
                            .attachFiles(attachment)
                            .setThumbnail('attachment://icon.png')
                            .setTimestamp(request.created_at)
                            .addField('Departure', request.departure, true)
                            .addField('Arrival', request.arrival, true)
                            .addField('Aircraft', request.aircraft.name);
                        pagesArray.push(embed);
                    });
                    new rm.menu({
                        channel: message.channel,
                        userID: message.author.id,
                        pages: pagesArray
                    });
                }
                else {
                    const embed = new MessageEmbed()
                        .setColor('FF550B')
                        .setTitle('No Requests')
                        .setDescription('There are no public Shared Cockpit requests matching that search query. You can run the command `.sc add` to create a request');
                    message.reply(embed);
                }
            })
            .catch(error => {
                console.log(error);
            });
        }).catch(err => {
            console.log(err);
        });
    }

    async add(message, params, token) {
        let data = {
            departure: '',
            arrival: '',
            aircraft: '',
            requestee_id: message.author.id
        };
        let fail = false;
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Add a New Public Shared Cockpit Request')
            .setDescription('Enter a comma separated list of preferred departure airport ICAO codes, you may only enter one or you can enter `none` for no preference.\nRemember you must have at least one departure or arrival airport set');
        message.channel.send(embed);
        message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 30000}).then(collected => {
            if (collected.first().content.toLowerCase() == 'none') {
                data.departure = null;
            } else {
                const params = collected.first().content.split(/\s*,\s*/u);
                params.forEach(function(param, index) {
                    if (/^[A-Z]{4}$/i.test(param)) { // for airports
                        return params[index] = param.toUpperCase();
                    } else {
                        fail = true;
                        const embed = new MessageEmbed()
                            .setColor('FF550B')
                            .setTitle('Invalid Airport ICAO Code')
                            .setDescription('Your inputted departure `' + param + '` is not a valid ICAO code, to try again, simply run `.sc add` again');
                        return message.reply(embed);
                    }
                });
                data.departure = params;
            }
            if (fail) {
                return;
            };
            embed.setDescription('Enter a comma separated list of preferred arrival airport ICAO codes, you may only enter one or you can enter `none` for no preference.\nRemember you must have at least one departure or arrival airport set');
            message.channel.send(embed);
            message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 30000}).then(collected => {
                if (collected.first().content.toLowerCase() == 'none') {
                    data.arrival = null;
                    if (!data.departure && !data.arrival) {
                        fail = true;
                        const embed = new MessageEmbed()
                            .setColor('FF550B')
                            .setTitle('No Airport Preference Set')
                            .setDescription('You have not set a departure or arrival preference, please try again by running `.sc add`');
                        return message.reply(embed);
                    }
                } else {
                    const params = collected.first().content.split(/\s*,\s*/u);
                    params.forEach(function(param, index) {
                        if (/^[A-Z]{4}$/i.test(param)) { // for airports
                            return params[index] = param.toUpperCase();
                        } else {
                            fail = true;
                            const embed = new MessageEmbed()
                                .setColor('FF550B')
                                .setTitle('Invalid Airport ICAO Code')
                                .setDescription('Your inputted arrival `' + param + '` is not a valid ICAO code, to try again, simply run `.sc add` again');
                            return message.reply(embed);
                        }
                    });
                    data.arrival = params;
                }
                axios.get(`${process.env.REQUEST_URL}api/aircraft`, {
                    headers: {
                        'Accept':'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                }).then(response => {
                    embed.setDescription('Enter the ID of the aircraft you would like to add to your request');
                    response.data.forEach(aircraft => {
                        embed.addField(aircraft.name, `ID: ${aircraft.id}, ICAO: ${aircraft.icao}, Sim: ${aircraft.sim}`);
                    });
                    message.channel.send(embed);
                    message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 30000}).then(collected => {
                        var id = parseInt(collected.first().content, 10);
                        if (0 < id <= response.data.length) {
                            data.aircraft = id;
                        } else {
                            fail = true;
                            const embed = new MessageEmbed()
                                .setColor('FF550B')
                                .setTitle('Invalid Aircraft ID')
                                .setDescription('Your inputted aircraft `' + id + '` is not a valid aircraft ID code, to try again, simply run `.sc add` again');
                            return message.reply(embed);
                        }
                        const embed = new MessageEmbed()
                            .setColor('FF550B')
                            .setTitle('Add a New Public Shared Cockpit Request')
                            .setDescription('Confirm the details for your Shared Cockpit Request')
                            .addField('Departure', data.departure, true)
                            .addField('Arrival', data.arrival, true)
                            .addField('Aircraft ID', data.aircraft);
                        message.reply(embed).then(msgEmbed => {
                            msgEmbed.react('👍');
                            msgEmbed.react('👎');
                            msgEmbed.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
                                {max: 1, time: 30000}).then(collected => {
                                if (collected.first().emoji.name == '👍') {
                                    msgEmbed.delete().catch(err => {
                                        console.log(err);
                                    });
                                    if (fail) {
                                        return;
                                    } else {
                                        axios.post(`${process.env.REQUEST_URL}api/create`, data, {
                                            headers: {
                                                'Accept':'application/json',
                                                'Authorization': 'Bearer ' + token,
                                            }
                                        }).then(response => {
                                            if (response.data.code == '200') {
                                                if (response.data.message.departure == null) {
                                                    response.data.message.departure = 'N/A';
                                                }
                                                if (response.data.message.arrival == null) {
                                                    response.data.message.arrival = 'N/A';
                                                }
                                                if (response.data.message.departure && response.data.message.departure.length > 1) {
                                                    response.data.message.departure = response.data.message.departure.join('/');
                                                }
                                                if (response.data.message.arrival && response.data.message.arrival.length > 1) {
                                                    response.data.message.arrival = response.data.message.arrival.join('/');
                                                }
                                                const embed = new MessageEmbed()
                                                    .setTitle('Confirmation of your Shared Cockpit Request')
                                                    .setColor('FF550B')
                                                    .setDescription('Below are the details of your new created public request')
                                                    .addField('Departure', response.data.message.departure, true)
                                                    .addField('Arrival', response.data.message.arrival, true)
                                                    .addField('Aircraft ID', response.data.message.aircraft_id)
                                                    .setTimestamp(response.data.message.created_at);
                                                message.reply(embed);
                                            } else {
                                                const embed = new MessageEmbed()
                                                    .setTitle('There has been an error while creating your request')
                                                    .setColor('FF550B')
                                                    .setDescription(response.data.message);
                                                message.reply(embed);
                                            }
                                        });
                                    }
                                } else
                                    msgEmbed.delete();
                                    return;
                                });
                            });
                        });
                }).catch(err => {
                    console.log(err);
                });
            });
        });
    }

    async accept(message, params, token) {
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Accept a Flight Request')
            .setDescription('Enter the ID of the request you would like to accept.\nThis can be found by running `.sc search`');
        message.channel.send(embed);
        message.channel.awaitMessages(m=> m.author.id === message.author.id, {max: 1, time: 10000}).then(collected => {
            var requestId = parseInt(collected.first().content, 10);
            if (typeof requestId == 'number') {
                const data = {
                    discord_id: message.author.id,
                    id: requestId
                };
                axios.post(`${process.env.REQUEST_URL}api/accept`, data, {
                    headers: {
                        'Accept':'application/json',
                        'Authorization': 'Bearer ' + token,
                    }
                }).then(response => {
                    if (response.data.code == '200') {
                        if (response.data.message.departure == null) {
                            response.data.message.departure = 'N/A';
                        }
                        if (response.data.message.arrival == null) {
                            response.data.message.arrival = 'N/A';
                        }
                        if (response.data.message.departure && response.data.message.departure.length > 1) {
                            response.data.message.departure = response.data.message.departure.join('/');
                        }
                        if (response.data.message.arrival && response.data.message.arrival.length > 1) {
                            response.data.message.arrival = response.data.message.arrival.join('/');
                        }
                        console.log(response.data.message);
                        const embed = new MessageEmbed()
                            .setColor('FF550B')
                            .setTitle('Request Acceptance Confirmation')
                            .setDescription(`This is a confirmation of your acceptance of ${response.data.message.requestee.username}'s request, the details are as follows:`)
                            .addField('Departure', response.data.message.departure, true)
                            .addField('Arrival', response.data.message.arrival, true)
                            .addField('Aircraft', response.data.message.aircraft.name)
                            .setTimestamp(response.data.message.created_at);
                        message.reply(embed);
                    } else {
                        const embed = new MessageEmbed()
                            .setTitle('There has been an error while accepting the request')
                            .setColor('FF550B')
                            .setDescription(response.data.message);
                        message.reply(embed);
                    }
                }).catch(err => {
                    console.log(err);
                });
            } else {
                const embed = new MessageEmbed()
                    .setColor('FF550B')
                    .setTitle('Request Acceptance Error')
                    .setDescription('Your inputted request ID `' + param + '` is not a valid ID\nTo try again, simply run `.sc accept`');
                return message.reply(embed);
            }
        });
    }

    async help(message, params) {
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Shared Cockpit Command Options')
            .setDescription('Below is a list of all the available Shared Cockpit command options and their usage with some examples.\nYou are required to link your Copilot account to discord for any commands other than the search command, this can be done at https://multicrew.co.uk/connect')
            .addField('🔍 Search', 'Search all public Shared Cockpit Requests\nUsage: `.sc search`')
            .addField('✅  Accept', 'Accept a Shared Cockpit Request\nUsage: `.sc accept`')
            .addField('➕ Add', 'Create a public Shared Cockpit Request\nUsage: `.sc add`');
            //.addField('🗑 Delete', 'Delete a Shared Cockpit Request\nUsage: `.sc delete`');
        message.channel.send(embed);
    }
};

module.exports = SCCommand;
