// dependencies
var express = require('express');
var bodyParser = require("body-parser");
var app = express();

// configure packages to be used
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set the templating engine
app.set('view engine', 'ejs');
// tell the server where the views are
app.set('views', __dirname + '/../public/views');
// tell the server where the routes are
var routes =require("./routes.js")(app);
// setup where the server will look for statics
app.use(express.static(__dirname + '/../public'));

// export the app
module.exports = app;