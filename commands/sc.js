const axios = require('axios')
const config = require('config');
const AsciiTable = require('ascii-table');
const Discord = require('discord.js');
let token;
const airportRegex = /[A-Z]{4}/;
const aircraftRegex = /[A-Z]{1,}[0-9]{1,}[A-Z]?/;

module.exports = {
    name: 'sc',
    description: 'Interact with Shared Cockpit Requests',
    help: true,
    async execute(message, args) {
        var data = {
            'grant_type': 'client_credentials',
            'client_id': 3,
            'client_secret': config.get('request.secret')
        }
        await axios.post(`${config.get('request.url')}oauth/token`, data)
        .then(function(response) {
            token = response.data['access_token'];
		});
        const type = args[0];
        args.shift();
        switch (type) {
            case 'search':
                search(message, args);
                break;
            case 'add':
                add(message, args);
                break;
            case 'accept':
                break;
            case 'delete':
                break;
            case 'help':
                help(message, args);
                break;
            default:
                help(message, args);
                break;
        }
    }
}

// Search for requests
function search(message, args){
    var options = 0
    if(args.length > 0){
        options = {
            headers: {
                'Accept':'application/json',
                'Authorization': 'Bearer ' + token
            },
            data: {'query': args}
        }
    }
    else {
        options = {
            headers: {
                'Accept':'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
    }
    axios.get(`${config.get('request.url')}api/search`, options)
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
        console.log(error.response)
    });
}

// Add a request
function add(message, args){
    for (let i = 0; i < args.length; i++) {
        if (i === 0 | i === 1) {
            if (!argCheck(args[i], 'airport')) {
                message.reply('your argument `' + args[i] + '` is invalid, please ensure you enter a 4 letter ICAO code, for example EGLL');
                return;
            }
        }
        else if (i == 2){
            if (!argCheck(args[i], 'aircraft')) {
                message.reply('your argument `' + args[i] + '` is invalid, please ensure you enter a 4 letter ICAO code, for example A320');
                return;
            }
        }
        else if (i > 2){
            message.reply('you have entered too many arguments, please stick to the following format: `Departure ICAO, Arrival ICAO, Aircraft ICAO`');
        }
    };
    options = {
        headers: {
            'Accept':'application/json',
            'Authorization': 'Bearer ' + token
        }
    }
    const data = {
        discord_id: message.author.id,
        departure: args[0],
        arrival: args[1],
        aircraft: args[2]
    }
   axios.post(`${config.get('request.url')}api/create`, data, options)
    .then(function(response) {
        if(response.data == 0) {
            message.reply('you have not linked your Discord account to copilot, please head over to https://multicrew.co.uk/connect to connect it.')
        }
        else{
            const table = new AsciiTable('Flight Request Confirmation');
            table.setHeading('ID', 'Departure', 'Arrival', 'Aircraft');
            table.addRow(response.data.id, response.data.departure, response.data.arrival, response.data.aircraft);
            message.reply("```" + table.toString() + "```");
        }
    })
    .catch(error => {
        console.log(error)
    });

}

// Accept a request
function accept(message, args){

}

// Delete a request
function clear(message, args){

}

// Help command
function help(message, args){
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

// Creates an ascii table for the data to be displayed
function createTable(data) {
    const table = new AsciiTable('Search Results');
    table.setHeading('ID', 'Departure', 'Arrival', 'Aircraft');
    data.forEach(item => {
        table.addRow(item.id, item.departure, item.arrival, item.aircraft)
    })
    return table;
}


// Checks to see if the arguments are valid aircraft/airport ICAO codes
function argCheck(arg, type){
    switch (type) {
        case 'airport':
            if (arg.match(airportRegex)){
                return true;
            }
            else {
                return false;
            }
        case 'aircraft':
            if (arg.match(aircraftRegex)){
                return true;
            }
            else {
                return false;
            }
        default:
            return false;
    }
}
