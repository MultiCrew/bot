const axios = require('axios')
const config = require('config');
const AsciiTable = require('ascii-table');
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
        
            default:
                break;
        }
    }
}

function search(message, args){
    var options = 0
    if(args.length > 0){
        options = {
            headers: {
                'Accept':'application/json',
                'Authorization': 'Bearer ' + token
            },
            data: {
                'query': args
            }
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
        const fTable = createTable(response.data);
        message.reply("```" + fTable.toString() + "```");
    })
    .catch(error => {
        console.log(error.response)
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

// Checks to see if the arguments are valid aircraft/airport ICAO codes
function argCheck(arg){
    if (arg.match(airportRegex)) {
        airportList.push(arg);
    }
    else if (arg.match(aircraftRegex)) {
        aircraftList.push(arg);
    }
}