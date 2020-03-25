const { Route } = require('klasa-dashboard-hooks');

module.exports = class extends Route {

    constructor(...args) {
        super(...args, {
            route: '/webhook',
            authenticated: false
        });
    }

    post(request, response) {
        console.log(request);
        return response.end(request);
    }
};