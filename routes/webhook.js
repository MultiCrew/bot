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
                break;
            case 'role':
                break;
            default:
                break;
        }
        return response.end();
    }
};