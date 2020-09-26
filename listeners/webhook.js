const { Listener } = require('discord-akairo');

class WebhookListener extends Listener {
    constructor() {
        super('webhook', {
            event: 'webhook',
            emitter: 'process'
        });
    }

    exec(data) {
        console.log(data);
    }
}

module.exports = WebhookListener;