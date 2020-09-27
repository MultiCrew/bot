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
            // usage: '<search|add|accept|delete|help:default> (departure:airportICAO) (arrival:airportICAO) (aicraft:aircraftICAO)',
            // usageDelim: ' ',
            args: [
                {
                    id: 'type',
                    type: ['search', 'add', 'accept', 'delete', 'help'],
                    default: 'help'
                }
            ]
        });
    }

    exec(message, args) {
        switch (args.type) {
            case 'search':
                return this.search(message, args);
                break;
            case 'add':
                return this.add(message, args);
                break;
            case 'accept':
                return this.accept(message, args);
                break;
            case 'delete':
                return this.delete(message, args);
                break;
            case 'help':
                return this.help(message, args);
                break;
            default:
                return this.help(message, args);
                break;
        }
    }

    async search(message, args) {
        const token = await getToken();
        var options = 0;
        var fail = false;
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Search all public Shared Cockpit Requests')
            .setDescription('Please enter a comma separated list of Aircraft or Airport ICAO codes you would like to search with.\nIf you would like to search for all public requests, just type `none`');
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
                            .setDescription('<@!' + message.author.id + '>, your inputted search query `' + param + '` is not a valid ICAO code, to try a new search query, simply run `.sc search` again');
                        return message.channel.send(embed);
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
                        if (request.departure.length > 1) {
                            request.departure = request.departure.join('/');
                        }
                        if (request.arrival.length > 1) {
                            request.arrival = request.arrival.join('/');
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
                            .addField('Arrival', request.arrival)
                            .addField('Aircraft ICAO', request.aircraft.icao, true)
                            .addField('Aircraft Simulator', request.aircraft.sim, true);
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
    async add(message, params) {}
    async accept(message, params) {}
    async delete(message, params) {}
    async help(message, params) {
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Shared Cockpit Command Options')
            .setDescription('Below is a list of all the available Shared Cockpit command options and their usage with some examples.\nYou are required to link your Copilot account to discord for any commands other than the search command, this can be done at https://multicrew.co.uk/connect')
            .addField('🔍 Search', 'Search all public Shared Cockpit Requests\nUsage: `.sc search`')
            .addField('✅  Accept', 'Accept a Shared Cockpit Request\nUsage: `.sc accept')
            .addField('➕ Add', 'Create a public Shared Cockpit Request\nUsage: `.sc add`')
            .addField('🗑 Delete', 'Delete a Shared Cockpit Request\nUsage: `.sc delete`');
        message.channel.send(embed);
    }
};

// Get client token from server
async function getToken() {
    var data = {
        'grant_type': 'client_credentials',
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET
    };
    const token = await axios.post(`${process.env.REQUEST_URL}oauth/token`, data)
    .then(function(response) {
        return response.data['access_token'];
    });
    return token;
}

module.exports = SCCommand;
