/* Need a header here */

/* Comment need: why are these lines here? */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    swig = require('swig'),
    SpotifyStrategy = require('./passport-spotify/index').Strategy,
    consolidate = require('consolidate'),
    SpotifyWebApi = require('spotify-web-api-node');

// API needs these to communicate with Spotify's database
var appKey = '2f1def3a12c34f8083a6fae3ace4fd32';
var appSecret = '7ba7b27730e548a8a129287bb9ef1f4f';

//   Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized. <---- reword or remove comment.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and spotify
//   profile), and invoke a callback with a user object.
passport.use(new SpotifyStrategy({
    clientID: appKey,
    clientSecret: appSecret,
    callbackURL: 'http://localhost:8888/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      // To keep the example simple, the user's spotify profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the spotify account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  })
);

var app = express();

// tell the server where the views are
app.set('views', __dirname + '/../public/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({
    secret: 'keyboard cat'
}));
// configure packages to be used
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/../public'));

app.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        requestData(req, res);
    } else {
        res.redirect('/login');
    }
});

app.get('/login', function(req, res) {
    res.render('login.ejs');
});

app.get('/sunburst', function (req, res) {
    res.render('sunburst.ejs');
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private', 'user-top-read'],
        showDialog: true
    }),
    function(req, res) {
        // The request will be redirected to spotify for authentication, so this
        // function will not be called.
    });

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
    passport.authenticate('spotify', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/logout');
});

// Gets all the data (tracks, artists...) and passes to the view.
function requestData(req, res) {
    var spotifyApi = new SpotifyWebApi({
        clientId: appKey,
        clientSecret: appSecret,
        redirectUri: 'http://localhost:8888/callback'
    });
    spotifyApi.setAccessToken(req.user.oauth);
    requestTracks(spotifyApi, res, requestArtists);
}

// render the home page
function renderHome(res, tracks, artists, genres, trackStats) {
  console.log("trackstats:");
  console.log(trackStats);
    res.render('home.ejs',
    {
        topTracks: tracks,
        topArtists: artists,
        topGenres: genres,
        trackAnalysis: trackStats
    }
    );
}

function dashboardData(spotifyApi, res, tracks, artists, genres, callback){
  var trackIds = [];
  //store the analysis for the tracks
  for (i = 0; i < 10; i++) {
    trackIds.push(tracks[i].id);
  }
  /* Get Audio Features for a Track */
spotifyApi.getAudioFeaturesForTracks(trackIds)
  .then(function(data) {
    console.log(data.body); 
    var dashboardPass = [];
    var trackData = data.body.audio_features;
    for (i = 0; i < trackData.length; i++) {
      
      dashboardPass.push({
      rank: i+1,
      danceability: trackData[i].danceability,
      energy: trackData[i].energy,
      speechiness: trackData[i].speechiness,
      acousticness:  trackData[i].acousticness,
      liveness: trackData[i].liveness
      });
      
    }
    console.log(dashboardPass);
    callback(res, tracks, artists, genres, dashboardPass);
  }, function(err) {
    done(err);
  });
}
// get the genres for your top tracks
function makeGenres(spotifyApi, res, tracks, artists, callback) {
    var trackIds = [];

    // Used to store multiple ids.
    for (i = 0; i < tracks.length; i++) {
      trackIds.push(tracks[i].artists[0].id);
    }

    // Gets all the genres and make a callback.
    spotifyApi.getArtists(trackIds, function(err, data) {
        if (err) {
            console.error('Something went wrong in getArtists request!');
        } else {
            var genres = [];
            var gnrArtists = data.body.artists;
            for (i = 0; i < gnrArtists.length; i++) {
              genres.push(gnrArtists[i].genres);
            }
            callback(spotifyApi, res, tracks, artists, genres, renderHome);
        }
    });
}

// Gets top 10 tracks
function requestTracks(spotifyApi, res, callback) {
    spotifyApi.getMyTopTracks({
        time_range: 'short_term',
        limit: 50
    }, function(err, data) {
        if (err) {
            console.error('Something went wrong in tracks request!');
        } else {
            callback(spotifyApi, res, data.body.items, makeGenres);
        }
    });
}
// Gets top 10 artists
function requestArtists(spotifyApi, res, tracks, callback) {
    spotifyApi.getMyTopArtists({
        time_range: 'short_term',
        limit: 10
    }, function(err, data) {
        if (err) {
            console.error('Something went wrong in artists request!');
        } else {
            callback(spotifyApi, res, tracks, data.body.items, dashboardData);
        }
    });
}

// export the app
module.exports = app;
