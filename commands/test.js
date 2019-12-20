const axios = require('axios')
const config = require('config')

module.exports = {
    name:'test',
    execute(message, args) {
        message.reply('it worked');
    }
}