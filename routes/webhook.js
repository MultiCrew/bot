const { Route } = require('klasa-dashboard-hooks');
const querystring = require('querystring');

module.exports = class extends Route {

    constructor(...args) {
        super(...args, {
            route: 'webhook',
            authenticated: false
        });
    }

    post(request, response) {
        const parsed = querystring.parse(request.body);
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
                    user.send(parsed.message);
                });
                break;
            default:
                break;
        }
        return response.end();
    }
};