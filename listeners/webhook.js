const { Listener } = require('discord-akairo');

class WebhookListener extends Listener {
    constructor() {
        super('webhook', {
            event: 'webhook',
            emitter: process
        });
    }

    exec(data) {
        switch (data.type) {
            case 'notification':
                this.client.users.fetch(data.id).then(user => {
                    user.send(data.message);
                });
                break;
            case 'role':
                break;
            case 'connection':
                this.client.users.fetch(data.id).then(user => {
                    const guild = this.client.guilds.cache.get('440545668168286249');
                    for (let i = 0; i < data.optional.length; i++) {
                        const id = data.optional[i];
                        if(id == '440550777912819712') { continue; }
                        let role = guild.roles.cache.get(id);
                        const member = guild.member(user);
                        member.roles.add(role);
                    }
                    user.send(data.message);
                });
                break;
            case 'beta_notification':
                this.client.channels.cache.get('741561495699062865').send(data.message);
                break;
            default:
                break;
        }
    }
}

module.exports = WebhookListener;