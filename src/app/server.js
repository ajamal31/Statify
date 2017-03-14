/* This file handles the spotfiy authentication*/
/* NOTE: THERE ARE ROUTES IN THIS FILE AND THEY SHOULD NOT BE IN HERE, SO THEY NEED TO BE MOVED!!!*/

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    swig = require('swig'),
    SpotifyStrategy = require('./passport-spotify/index').Strategy;
    
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId : '2f1def3a12c34f8083a6fae3ace4fd32',
  clientSecret : '7ba7b27730e548a8a129287bb9ef1f4f',
  redirectUri : 'http://localhost:8888/callback'
});

// Retrieve an access token
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    // Set the access token on the API object so that it's used in all future requests
    spotifyApi.setAccessToken(data.body['access_token']);
  });
  
spotifyApi.getMe()
  .then(function(data) {
    console.log('Some information about the authenticated user', data.body);
  }, function(err) {
    console.log('Something went wrong!', err);
  });

var app = express();
// tell the server where the views are
app.set('views', __dirname + '/../public/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser());
app.use(express.static(__dirname + '/../public'));

var routes =require("./routes.js")(app);
// export the app
module.exports = app;