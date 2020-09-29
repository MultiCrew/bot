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
                    const roles = [];
                    Object.entries(data).forEach(entry => {
                        const [key, value] = entry;
                        if (key.includes('optional')) {
                            const index = key.split(/[\[\]']+/g)[1];
                            roles[index] = value;
                        }
                    });

                    const guild = this.client.guilds.cache.get('440545668168286249'); // MultiCrew Discord Guild ID
                    for (let i = 0; i < roles.length; i++) {
                        const id = roles[i];
                        if(id == '136184427318476800') { continue; } // MultiCrew Team Role ID (will cause permission errors if not skipped)
                        let role = guild.roles.cache.get(id);
                        const member = guild.member(user);
                        member.roles.add(role).catch(err => {
                            console.log(err);
                        });
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