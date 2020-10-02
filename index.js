const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const axios = require('axios');
require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

class MyClient extends AkairoClient {
    constructor() {
        super({
            // Options for Akairo go here.
        }, {
            // Options for discord.js goes here.
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './commands/',
            prefix: '.'
		});

		this.listenerHandler = new ListenerHandler(this, {
            directory: './listeners/'
		});
		
        this.listenerHandler.setEmitters({
            process: process,
        });
		
		this.commandHandler.loadAll();
        this.listenerHandler.loadAll();

        getToken().then(token => {
            this.apiToken = token;
        });
    }
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

const client = new MyClient();
client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    client.user.setStatus('idle');
    client.user.setActivity('.sc', {
        type: 'WATCHING'
    });
    console.log(`Successfully initialized.`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    process.emit('webhook', req.body);
    return res.end();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});