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
var appKey =  '2f1def3a12c34f8083a6fae3ace4fd32';
var appSecret = '7ba7b27730e548a8a129287bb9ef1f4f';

//   Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized. <---- reword or remove comment.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
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
    function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's spotify profile is returned to
            // represent the logged-in user. In a typical application, you would want
            // to associate the spotify account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }));

var app = express();

// tell the server where the views are
app.set('views', __dirname + '/../public/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({secret: 'keyboard cat'}));
// configure packages to be used
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/../public'));

app.get('/', function (req, res) {
    requestData(req, res);
});

app.get('/login', function (req, res) {
    res.render('login.ejs', {user: req.user});
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
    passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private', 'user-top-read'], showDialog: true}),
    function (req, res) {
// The request will be redirected to spotify for authentication, so this
// function will not be called.
    });

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
    passport.authenticate('spotify', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Gets all the data (tracks, artists...) and passes to the view.
function requestData(req, res) {
    var spotifyApi = new SpotifyWebApi({
      clientId : appKey,
      clientSecret : appSecret,
      accessToken : req.user.oauth,
      redirectUri : 'http://localhost:8888/callback'
    });
    requestTracks(spotifyApi, res);
}

// Gets top 10 tracks
function requestTracks(spotifyApi, res) {
    spotifyApi.getMyTopTracks({time_range: 'short_term', limit: 10})
    .then(function(data) {
      console.log('Top tracks', data.body.items);
      res.render('home.ejs', {topTracks: data.body});
    }, function(err) {
      console.log('Something went wrong!', err);
    });
}

// export the app
module.exports = app;
