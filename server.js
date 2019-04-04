/****************************************************************
This file is the driver behind the entire Node JS application.
To start your application, navigate to the directory where this
file is contained via a terminal and type "node server.js"
****************************************************************/

//import the environment with our sensitive data
require('dotenv').config();

/* Import needed dependencies */
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const engine = require('ejs-locals');
const http = require('http');
const Q = require('q');
const uuidv4 = require('uuid/v4');
const passport = require('passport');
const StrategyGoogle = require('passport-google-openidconnect').Strategy;
const PythonShell = require('python-shell').PythonShell;

var db = require('./db'); //initializes the database connection and allows to access the models we created
var memes = require('./controllers/memes'); //imports the functions from the meme controller
var Images = require('./model/images'); //allows access the images table from the database
var Users = require('./model/users'); //allows access the users table from the database
var CSKeys = require('./model/cskeys'); //allows access the cross server keys table from the database

const PORT = 1337; //the port the http server will listen on
var connectionsArray = []; //used to track clients that connect to the web socket server

var app = express(); //create the express app
var server = http.createServer(app); //create an http server using the express app
var io = require('socket.io').listen(server); //creates a web socket server that will be used for real time updating. You will use this in part 2 of the lab.

/* This section configures the express app */
app.engine('ejs', engine); //use ejs as the templating engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser(process.env.SESSION_SECRET || 'your session secret'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(session({
	secret: process.env.SESSION_SECRET || 'your session secret',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/assets'));

/* This starts your http server on the given port */
server.listen(PORT, function () {
	console.log('Server started on port ' + PORT)
})

//configure passport authentication
passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

//this sets up the authentication used in part 2
//fill in the prompted areas after you set up your google project in the .env file
passport.use(new StrategyGoogle({
	clientID: process.env.GOOGLE_CLIENT_ID || '912887461290-ep7ml4ea3n11j0v21vao1djb70j6e6nl.apps.googleusercontent.com',
	clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'VLisnm20wzpmw0Xs0apcUn8j',
	callbackURL: 'http://nodejs.' + (process.env.NET_ID || 'rhulet34') + '.it210.it.et.byu.edu/auth/google/return'
},//CHANGE FOR PROD
	function (iss, sub, profile, accessToken, refreshToken, done) {
		done(null, profile);
	}
));

/* These are the routes. They take a path and route it to either the render/redirect
function while linking them with the data necessary for their functionality */
app.get('/memes', function (req, res) {
	memes.getMemeData(req).then(function (memeData) {
		res.render('memes', memeData);
	})
});
app.get('/memes/user', function (req, res) {
	memes.userLogin(req).then(function () {
		res.redirect('/memes');
	})
});
app.get('/memes/logout', function (req, res) {
	memes.logout(req);
	res.redirect('/memes');
});

/* DO WORK BELOW, ADD ANOTHER ROUTE FOR PART 1!
Here you will need to add another route for dynamic routing according to a users ID. For example,
you will need to use a route that looks something like /memes/:UserID/view. You can access parameters in
the URL by using something like '/:id/' where the : indicates that 'id' is a variable that you
can then access by using req.params.id. This will look at lot like the app.get('/memes') function
except you will want to use the getViewData function in memes.js that you wrote/will write
*/

app.get('/memes/:UserId/view', function (req, res) {
	memes.getViewData(req)
		.then((memeData) => {
			res.render('view', memeData);
		});
})


app.get('/', function (req, res) {
	res.render('index');
})

app.get('/login', function (req, res) {
	res.render('login');
})

app.get('/auth/google', passport.authenticate('google-openidconnect', {
	scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
},
	{ failureRedirect: '/login' }), function (req, res) {
		res.redirect('/memes/user');
	})

app.get('/auth/google/return', passport.authenticate('google-openidconnect', { failureRedirect: '/login' }), function (req, res) {
	//generate key to use for creating memes
	generateKey(req, uuidv4()).then(function (key) {
		req.user.cskey = key;
		res.redirect('/memes/user');
	});
})

//generates a key to use for cross server validation
function generateKey(req, key) {
	return CSKeys.findAll({ where: { uuid: key } }).then(function (result) {
		//if key already exists, create a new key
		if (result.length) {
			return generateKey(req, uuidv4())
		} else {
			return CSKeys.create({
				uuid: key,
				email: req.user._json.email
			}).then(function () {
				return key
			})
		}
	}).catch(function (err) {
		console.error('generateKey error', err);
	})
}

app.get('/logout', function (req, res) {
	res.redirect('/memes/logout');
})

/*
 This section configures what your web socket server will do on an incoming connection.
 Whenever new information should be pushed to the clients, it is sent to all of the connected clients.
 THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION.
*/
io.sockets.on('connection', function (socket) {
	connectionsArray.push(socket);
	console.log('A new socket has connected, total connected: ', connectionsArray.length);

	//sets up a handler for the disconnect event
	socket.on('disconnect', function () {
		var socketIndex = connectionsArray.indexOf(socket);
		if (socketIndex >= 0) {
			connectionsArray.splice(socketIndex, 1);
			console.log('socket ' + socketIndex + ' disconnected');
		}
	})

	//sets up a handler for the button_click event
	socket.on('button_click', function (imageId, buttonId) {
		Images.find({ where: { imageId: imageId } }).then(function (image) {
			image.updateAttributes({ numLikes: ++image.numLikes }) //update the image record in the database
			io.emit('return_click', image, buttonId); //trigger the return_click event and send the updated information to all clients
		})
	})
})

app.get('/meme-hook', function (req, res, next) {
	PythonShell.run('./scripts/mem-hook.py', null, function (err) {
		if (err) throw err;
		console.log('finished');
	  });
	  next()
}, function (req, res, next) {
	res.sendStatus(200)

	//if there are any current connections
	if (connectionsArray.length) {
		//runs the following functions asynchronously
		Q.all([
			Images.all({ raw: true }), //gets all images
			Users.all({ raw: true }) //gets all users
		]).then(function (results) {
			var images = results[0];
			var users = results[1];

			//we only need the user name from the Users results
			for (var i = 0, len = images.length; i < len; i++) {
				for (var j = 0, len2 = users.length; j < len2; j++) {
					if (images[i].userId === users[j].userId) {
						images[i].userName = users[j].userName;
						break;
					}
				}
			}

			//send images to all clients
			io.emit('notification', { images: images })
			next()
		}).catch(function (err) {
			console.error('meme-hook error', err);
		})
	}
})
// Tell the Browser to stop asking for the favicon :)
app.get('/favicon.ico', function (req, res) {
	res.status(204);
});
app.all('*', function (req, res) {
	console.log('URL HIT WITH NO ROUTE', req.originalUrl)
})
