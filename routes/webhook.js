const { Route } = require('klasa-dashboard-hooks');
const querystring = require('query-string');

module.exports = class extends Route {

    constructor(...args) {
        super(...args, {
            route: 'webhook',
            authenticated: false
        });
    }

    post(request, response) {
        const parsed = querystring.parse(request.body, {arrayFormat: 'index'});
        switch (parsed.type) {
            case 'notification':
                this.client.users.fetch(parsed.id).then(user => {
                    user.send(parsed.message);
                });
                break;
            case 'role':
                break;
            case 'connection':
                this.client.users.fetch(parsed.id).then(user => {
                    const guild = this.client.guilds.cache.get('440545668168286249');
                    for (let i = 0; i < parsed.optional.length; i++) {
                        if(id == '440550777912819712') { continue; }
                        const id = parsed.optional[i];
                        let role = guild.roles.cache.get(id);
                        const member = guild.member(user);
                        member.roles.add(role);
                    }
                    user.send(parsed.message);
                });
                break;
            default:
                break;
        }
        return response.end();
    }
};