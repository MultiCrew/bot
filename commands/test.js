const axios = require('axios')
const config = require('config')

module.exports = {
    name:'test',
    execute(message, args) {
        var data = {
            'grant_type': 'client_credentials',
            'client_id': 3,
            'client_secret': config.get('auth.secret')
        }
        axios.post('http://homestead.test/oauth/token', data)
        .then(function(response) {
            token = response.data['access_token'];
            const options = {
                headers: {
                    'Accept':'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            axios.get('http://homestead.test/api/search', options)
            .then(function(response) {
                console.log(response.data)
            })
            .catch(error => {
                console.log(error.response)
            });
          });
    }
}