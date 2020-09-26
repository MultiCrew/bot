const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
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

        // this.commandHandler.resolver.addType('aircraftICAO', (message, phrase) => {
        //     if (!phrase) return null;
        //     const regex = /[A-Z]{1,}[0-9]{1,}[A-Z]?/;

        //     const result = regex.exec(arg);
        //     if (result) {
        //         return arg.toUpperCase();
        //     } else {
        //         return null;
        //     }
        // });

        // this.commandHandler.resolver.addType('airportICAO', (message, phrase) => {
        //     if (!phrase) return null;
        //     const regex = /[A-Z]{4}/i;

        //     const result = regex.exec(arg);
        //     if (result) {
        //         return arg.toUpperCase();
        //     } else {
        //         return null;
        //     }
		// });
    }
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
    //return res.end();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});