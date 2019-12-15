const http = require('http');

var server = http.createServer(function(req, res) {
    if(req.method == 'POST'){
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            console.log(body);
            res.end(body);
        });
    }
}).listen(3000);