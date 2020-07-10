/* Need a header here */
/*jslint node: true */

/* Comment need: why are these lines here? */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    SpotifyStrategy = require('./passport-spotify/index').Strategy,
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
    }));

var app = express();
// tell the server where the views are
app.set('views', __dirname + '/../public/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
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
    res.redirect('/login');
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
function renderHome(res, tracks, artists, sunDat, trackStats) {
    res.render('home.ejs', {
        topTracks: tracks,
        topArtists: artists,
        sunDat: sunDat,
        trackAnalysis: trackStats
    });
}

function dashboardData(spotifyApi, res, tracks, artists, genres, callback) {
    var trackIds = [];
    //store the analysis for the tracks
    for (var i = 0; i < 10; i++) {
        trackIds.push(tracks[i].id);
    }
    /* Get Audio Features for a Track */
    spotifyApi.getAudioFeaturesForTracks(trackIds)
        .then(function(data) {
            var dashboardPass = [];
            var trackData = data.body.audio_features;
            for (var i = 0; i < trackData.length; i++) {
                dashboardPass.push({
                    rank: i + 1,
                    id: trackData[i].id,
                    danceability: trackData[i].danceability,
                    energy: trackData[i].energy,
                    loudness: trackData[i].loudness,
                    mode: convertMode(trackData[i].mode),
                    tempo: trackData[i].tempo,
                    valence: trackData[i].valence,
                    key: convertKey(trackData[i].key),
                    speechiness: trackData[i].speechiness,
                    acousticness: trackData[i].acousticness,
                    instrumentalness: trackData[i].instrumentalness,
                    liveness: trackData[i].liveness
                });
            }
            callback(res, tracks, artists, genres, dashboardPass);
        }, function(err) {
            done(err);
        });
}

// Convert spotify's int mode value and convert it into Major or Minor Text.
function convertMode(mode) {
    if (mode == 1) {
        return 'Major';
    } else {
        return 'Minor';
    }
}

// Convert spotify's int key value to the keys used in musical notes.
function convertKey(key) {
    if (key === 0) {
        return 'C';
    } else if (key == 1) {
        return 'C♯/D♭';
    } else if (key == 2) {
        return 'D';
    } else if (key == 3) {
        return 'D♯/E♭';
    } else if (key == 4) {
        return 'E';
    } else if (key == 5) {
        return 'F';
    } else if (key == 6) {
        return 'F♯/G♭';
    } else if (key == 7) {
        return 'G';
    } else if (key == 8) {
        return 'G♯/A♭';
    } else if (key == 9) {
        return 'A';
    } else if (key == 10) {
        return 'A♯/B♭';
    } else {
        return 'B';
    }
}


function getAlbums(albums, tracks) {
    var flag;
    for (var i = 0; i < tracks.length; i++) {
        var album = {
            artist: tracks[i].artists[0].name,
            album: tracks[i].album
        };
        flag = 0;
        for (var k = 0; k < albums.length; k++) {
            if (albums[k].album.id === album.album.id) {
                flag = 1;
                break;
            }
        }
        if (flag === 0)
            albums.push(album);
    }
}

function getAllArtists(allArtists, tracks) {
    var flag;
    for (var i = 0; i < tracks.length; i++) {
        var artist = tracks[i].artists[0];
        flag = 0;
        for (var k = 0; k < allArtists.length; k++) {
            if (allArtists[k].id === artist.id || allArtists[k].name === artist.name) {
                flag = 1;
                break;
            }
        }
        if (flag === 0)
            allArtists.push(artist);
    }
}

function getAllTracks(allTracks, tracks) {
    var flag;
    for (var i = 0; i < tracks.length; i++) {
        var track = {
            track: tracks[i],
            numPlays: 1
        };
        flag = 0;
        for (var k = 0; k < allTracks.length; k++) {
            if (allTracks[k].track.id === track.track.id) {
                allTracks[k].numPlays = (allTracks[k].numPlays + 1);
                flag = 1;
                break;
            }
        }
        if (flag === 0)
            allTracks.push(track);
    }
}

function sunburstData(spotifyApi, res, tracks, artists, callback) {
    var albumDat = [];
    var artistDat = [];
    var trackDat = [];
    var sunDat = [];
    var albums = [];
    var allArtists = [];
    var allTracks = [];

    getAlbums(albums, tracks);
    getAllArtists(allArtists, tracks);
    getAllTracks(allTracks, tracks);

    for (var k = 0; k < allArtists.length; k++) {

        for (var i = 0; i < albums.length; i++) {

            for (var j = 0; j < allTracks.length; j++) {

                if (allTracks[j].track.album.id === albums[i].album.id) {
                    trackDat.push({
                        name: allTracks[j].track.name.substring(0, allArtists.length < 15 ? allArtists.length : 13),
                        description: allTracks[j].track.name,
                        size: allTracks[j].numPlays,
                        level: 0
                    });
                }
            }

            if (albums[i].artist === allArtists[k].name) {
                albumDat.push({
                    name: albums[i].album.name.substring(0, allArtists.length < 15 ? allArtists.length : 13),
                    description: albums[i].album.name,
                    children: trackDat,
                    level: 2
                });
            }

            trackDat = [];

        }

        artistDat.push({
            name: allArtists[k].name.substring(0, allArtists.length < 15 ? allArtists.length : 13),
            description: allArtists[k].name,
            children: albumDat,
            level: 1
        });

        albumDat = [];
    }

    sunDat = JSON.stringify({
        name: 'Statify',
        description: 'Statify',
        children: artistDat
    });

    callback(spotifyApi, res, tracks, artists, sunDat, renderHome);
}

// Gets top 10 tracks
function requestTracks(spotifyApi, res, callback) {
    spotifyApi.getMyTopTracks({
        time_range: 'short_term',
        limit: 50
    }, function(err, data) {
        if (err) {
            console.error('Something went wrong in tracks request!');
          // Error handling if the user doesn't have enough information.
        } else if (data.body.items.length < 10) {
            res.render('error.ejs');
        } else {
            callback(spotifyApi, res, data.body.items, sunburstData);
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
