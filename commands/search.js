const db = require('../db');
const AsciiTable = require('ascii-table');
let resultList = [];
let airportList = [];
let aircraftList = [];
const airportRegex = /[A-Z]{4}/;
const aircraftRegex = /[A-Z]{1,}[0-9]{1,}[A-Z]?/;

module.exports = {
    name: 'search',
    description: 'Search all flights',
    help: true,
    execute(message, args) {
        if (args.length == 0) {
            db.query('SELECT * FROM flight_requests', function(err, res) {
                if (err) throw err;
                res.forEach(result => {
                   resultList.push(result);
                });
                const fTable = createTable(resultList);
                message.reply("```" + fTable.toString() + "```");
            })
        }
        args.forEach(arg => {
            argCheck(arg);
        });
        db.query(selectQuery(), function(err, res) {
            if (err) throw err;
            res.forEach(result => {
                resultList.push(result);
            })
            const fTable = createTable(resultList);
            message.reply("```" + fTable.toString() + "```");
        })
    }
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

// Selects a query based on the arguments inputted
function selectQuery() {
    var query = 0;
    if (airportList.length != 0 && aircraftList.length == 0) {
        query = 'SELECT * FROM flight_requests WHERE departure = "' + airportList + '" OR arrival = "' + airportList + '"';
        console.log(query);
    }
    else if (airportList.length == 0 && aircraftList.length != 0) {
        query = 'SELECT * FROM flight_requests WHERE aircraft = ' + aircraftList;
    }
    else if (aircraftList.length != 0 && aircraftList.length != 0) {
        query = 'SELECT * FROM flight_requests WHERE departure OR arrival = ' + airportList + 'OR aircraft = ' + aircraftList;
    }
    return query;
}