const { Command } = require('klasa');
const { Discord, MessageEmbed } = require('discord.js');
require('dotenv').config();
const axios = require('axios');

const AsciiTable = require('ascii-table');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: false,
            cooldown: 3,
            description: 'Interact with Shared Cockpit Requests',
            usage: '<search|add|accept|delete|help:default> (departure:airporticao) (arrival:airporticao) (aicraft:aircrafticao)',
            usageDelim: ' ',
            subcommands: true
        });
        this.createCustomResolver('airporticao', (arg, possible, message, params) => {
            if(params[0] == 'search' || params[0] == 'help') return arg;
            else {
                throw arg;
            }
        });
    }

    async run(message, [...params]) {
        //
    }

    async search(message, params) {
        var options = 0;
        if(params){
            options = {
                headers: {
                    'Accept':'application/json',
                    'Authorization': 'Bearer ' + await getToken()
                },
                data: {'query': params}
            };
        }
        else {
            options = {
                headers: {
                    'Accept':'application/json',
                    'Authorization': 'Bearer ' + await getToken()
                }
            };
        }
        axios.get(`${process.env.REQUEST_URL}api/search`, options)
        .then(function(response) {
            if(response.data.length > 0) {
                const fTable = createTable(response.data);
                message.reply("```" + fTable.toString() + "```");
            }
            else {
                message.reply('there are no public Shared Cockpit requests. You can run the command `.sc add` to create a request');
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    async add(message, params) {}
    async accept(message, params) {}
    async delete(message, params) {}
    async help(message, params) {
        const embed = new MessageEmbed()
            .setColor('FF550B')
            .setTitle('Shared Cockpit Command Options')
            .setDescription('Below is a list of all the available Shared Cockpit command options and their usage with some examples.\nYou are required to link your Copilot account to discord for any commands other than the search command, this can be done at https://multicrew.co.uk/connect \n\nAny arguments in square brackets e.g. `[Argument]` are required for the command.\nAny arguments in less/more than markers e.g. `<Argument>` are optional arguments.')
            .addField('🔍 Search', 'Search all public Shared Cockpit Requests\nUsage: `.sc search <Search Query>`\nExample: `.sc search DH8D`')
            .addField('✅  Accept', 'Accept a Shared Cockpit Request\nUsage: `.sc accept [Request ID]`\nExample: `.sc accept 5`')
            .addField('➕ Add', 'Create a public Shared Cockpit Request\nUsage: `.sc add [Departure ICAO] [Arrival ICAO] [Aircraft ICAO]`\nExample: `.sc add EHAM LOWI A320`')
            .addField('🗑 Delete', 'Delete a Shared Cockpit Request\nUsage: `.sc delete [Request ID]`\nExample: `.sc delete 5`');
        message.channel.send(embed);
    }
};

// Creates an ascii table for the data to be displayed
function createTable(data) {
    const table = new AsciiTable('Search Results');
    table.setHeading('ID', 'Departure', 'Arrival', 'Aircraft');
    data.forEach(item => {
        table.addRow(item.id, item.departure, item.arrival, item.aircraft);
    });
    return table;
}

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
