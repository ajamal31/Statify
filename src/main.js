var PORT = process.env.PORT || 8888;
var app = require('./app/server');

var http = require('http');
var server = http.Server(app);

server.listen(PORT, function() {
    console.log('server is running on localhost:' + PORT);
})
