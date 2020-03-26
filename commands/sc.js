const { Command } = require('klasa');
const { Discord } = require('discord.js');
require('dotenv').config();
const axios = require('axios');

let token;

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
            cooldown: 3,
            description: 'Interact with Shared Cockpit Requests',
            usage: '<search|add|accept|delete|help:default> (departure:icao) (arrival:icao) (aicraft:icao)',
            usageDelim: ' ',
            subcommands: true
        });
    }

    async run(message, [...params]) {
        // This is where you place the code you want to run for your command
        ;
    }

    async search(message, params) {}
    async add(message, params) {}
    async accept(message, params) {}
    async delete(message, params) {}
    async help(message, params) {
        const embed = new Discord.RichEmbed()
            .setColor('FF550B')
            .setTitle('Shared Cockpit Command Options')
            .setDescription('Below is a list of all the available Shared Cockpit command options and their usage with some examples.\nYou are required to link your Copilot account to discord for any commands other than the search command, this can be done at https://multicrew.co.uk/connect \n\nAny arguments in square brackets e.g. `[Argument]` are required for the command.\nAny arguments in less/more than markers e.g. `<Argument>` are optional arguments.')
            .addField('🔍 Search', 'Search all public Shared Cockpit Requests\nUsage: `.sc search <Search Query>`\nExample: `.sc search DH8D`')
            .addField('✅  Accept', 'Accept a Shared Cockpit Request\nUsage: `.sc accept [Request ID]`\nExample: `.sc accept 5`')
            .addField('➕ Add', 'Create a public Shared Cockpit Request\nUsage: `.sc add [Departure ICAO] [Arrival ICAO] [Aircraft ICAO]`\nExample: `.sc add EHAM LOWI A320`')
            .addField('🗑 Delete', 'Delete a Shared Cockpit Request\nUsage: `.sc delete [Request ID]`\nExample: `.sc delete 5`');
        message.channel.send(embed);
    }

    async init() {
        var data = {
            'grant_type': 'client_credentials',
            'client_id': process.env.CLIENT_ID,
            'client_secret': process.env.CLIENT_SECRET
        };
        await axios.post(`${process.env.REQUEST_URL}/oauth/token`, data)
        .then(function(response) {
            token = response.data['access_token'];
		});
    }

};
