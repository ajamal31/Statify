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

    // Get the most popular tracks by David Bowie in Great Britain
    return spotifyApi.getArtistTopTracks('3a9qv6NLHnsVxJUtKOMHvD', 'US')
  }).then(function(data) {
    console.log('The most popular tracks for the Glitch Mob is..');
    console.log('Drum roll..')
    console.log('...')

    data.body.tracks.forEach(function(track, index) {
      console.log((index+1) + '. ' + track.name + ' (popularity is ' + track.popularity + ')');
    });

  }).catch(function(err) {
    console.log('Unfortunately, something has gone wrong.', err.message);
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