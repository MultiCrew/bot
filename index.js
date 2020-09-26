const { AkairoClient, CommandHandler } = require('discord-akairo');
require('dotenv').config();

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
        this.commandHandler.loadAll();

        this.commandHandler.resolver.addType('aircraftICAO', (message, phrase) => {
            if (!phrase) return null;
            const regex = /[A-Z]{1,}[0-9]{1,}[A-Z]?/;

            const result = regex.exec(arg);
            if (result) {
                return arg.toUpperCase();
            } else {
                return null;
            }
        });

        this.commandHandler.resolver.addType('airportICAO', (message, phrase) => {
            if (!phrase) return null;
            const regex = /[A-Z]{4}/i;

            const result = regex.exec(arg);
            if (result) {
                return arg.toUpperCase();
            } else {
                return null;
            }
        });
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