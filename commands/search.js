const db = require('../db');
const AsciiTable = require('ascii-table')
let resultList = [];

module.exports = {
    name: 'search',
    description: 'Search all flights',
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
    }
}

function createTable(data) {
    const table = new AsciiTable('Search Results');
    table.setHeading('ID', 'Departure', 'Arrival', 'Aircraft');
    data.forEach(item => {
        table.addRow(item.id, item.departure, item.arrival, item.aircraft)
    })
    return table;
}