const axios = require('axios')
const config = require('config');
const AsciiTable = require('ascii-table');
const FormData = require('form-data');
let token;
let airportList = [];
let aircraftList = [];
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
            'client_secret': config.get('auth.secret')
        }
        await axios.post('http://homestead.test/oauth/token', data)
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
            default:
                list(message, args);
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
    axios.get('http://homestead.test/api/search', options)
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

function add(message, args){
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
    axios.post('http://homestead.test/api/create', data, options)
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

// Creates an ascii table for the data to be displayed
function createTable(data) {
    const table = new AsciiTable('Search Results');
    table.setHeading('ID', 'Departure', 'Arrival', 'Aircraft');
    data.forEach(item => {
        table.addRow(item.id, item.departure, item.arrival, item.aircraft)
    })
    return table;
}

/*
// Checks to see if the arguments are valid aircraft/airport ICAO codes
function argCheck(arg){
    if (arg.match(airportRegex)) {
        airportList.push(arg);
    }
    else if (arg.match(aircraftRegex)) {
        aircraftList.push(arg);
    }
}
*/