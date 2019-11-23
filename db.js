const mysql = require('mysql');
const config = require('config');

var connection = mysql.createConnection({
    host     : config.get('dbConfig.host'),
    user     : config.get('dbConfig.username'),
    password : config.get('dbConfig.password'),
    database : config.get('dbConfig.database')
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;