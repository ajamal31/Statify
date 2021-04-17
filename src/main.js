var PORT = process.env.PORT || 8888;
var app = require('./app/server');

app.listen(PORT, function() {
    console.log('server is running on localhost:' + PORT);
})
