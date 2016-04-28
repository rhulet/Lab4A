/****************************************************************
This file is the driver behind the entire Node JS application.
To start your application, navigate to the directory where this 
file is contained via a terminal (or command prompt) and type in 
the command "node server.js". 
****************************************************************/

var express = require('express'); //This imports the express packages and makes it available to this file.
var connect = require('connect'); //This imports the connect packages and makes it available to this file.
var morgan = require('morgan'); //This imports the morgan (logging) packages and makes it available to this file.
var cookieParser = require('cookie-parser'); //This imports the cookie parser packages and makes it available to this file.
var bodyParser = require('body-parser');//This imports the body parser packages and makes it available to this file.
var multer = require('multer'); //This imports the multer (works with body parsing) packages and makes it available to this file.
var methodOverride = require('method-override'); //This imports the method override packages and makes it available to this file.
var session = require('express-session');//This imports the session packages and makes it available to this file.

var db = require('./db'); //This imports the database connection and makes it usable by this page.
var path = require('path'); //This creates a variable used for various parts of a NodeJS app.
var connectionsArray  = []; //This creates an empty array that keeps a record of clients that are connected to the server so that can be updated when the database updates.
var engine = require('ejs-locals'); //This package is used for building out the views in your MVC
var passport = require('passport'); //This package is used for authentication (log in).  This will be used in part 2 of the NodeJS lab.
var util = require('util'); //This creates a variable used for various parts of a NodeJS app.
var StrategyGoogle = require('passport-google-openidconnect').Strategy; //This package is used for authentication with Google.  This will be used in part 2 of the NodeJS lab.

var POLLING_INTERVAL = 3000; //This is the time interval between polls on the database to check for any updates or changes.
var pollingTimer; //This is a variable used in the polling to check for any updated information in the database.
var images = require('./model/images'); // This imports the information from the images table in the database.
var Images = images.Images; //This allows the information from the images table in the database to be used on this page.
var users = require('./model/users'); // This imports the information from the users table in the database.
var Users = users.Users; //This allows the information from the users table in the database to be used on this page.
var sequelize = db.sequelize; //This imports the the sequelize package to utilize in querying the database for information.
var Sequelize = db.Sequelize; //This imports the the exact database connection information from db.js
var async = require('async'); //This package allows for asynchronous calls function calls, helping to streamline the the data flow for this app.
var http = require('http'); //This imports the needed packages to create an http server.
var app = express(); //This creates the instance of your app using NodeJS express.
var server = http.createServer(app); //This creates the actual http server.
var io  = require('socket.io').listen(server); //This creates a listener for socket connections.  This is used for real time updating.  You will use this in part 2 of the lab.


//Setting up the app with various modules
app.engine('ejs', engine);
  app.set('views', __dirname + '/views'); //Location of the views
  app.set('view engine', 'ejs');
  app.use(morgan('combined'));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(multer({dest:'./uploads/'}).single('singleInputFileName'));
  app.use(methodOverride());
  app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + '/../../public'));
  app.use(express.static(__dirname + '/assets'));


/*This starts the Node JS application and has it listening on port 1337.  
If you change the port you will have to navigate to a different port to view the website. 
Changing the port will also break the ability to access the page from nodejs.NETID.it.et.byu.edu 
So probably ... just ... don't change the port */
server.listen(1337);  
console.log('Listening to port 1337');  //This prints out on the console (where the app is running) that the app has started and is listening

//Set up login and authentication
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//this sets up the authentication used in part 2. Fill in the prompted areas after you set up your google project
passport.use(new StrategyGoogle({
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: "http://nodejs.YOUR_NET_ID.it210.it.et.byu.edu/auth/google/return"
  },
   function(iss, sub, profile, accessToken, refreshToken, done) {
    process.nextTick(function () {
      done(null, profile);
    });

  }
));

/*The following three lines define the controllers and allow you to create a new controller.  You shouldn't need to create new 
controllers, but if you do add a new element after 'memes', for example, add 'memes1' with comma seperation inside of the [] brackets.*/
['memes',].map(function(controllerName){
  var controller = require('./controllers/' + controllerName);
  controller.setup(app);
});

/*The following 'app.get' function redirects to / after logging in, 
if login fails then it redirects to the login page.  
THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION.*/
app.get('/', function(req, res){
  res.render('index');
});

/*The following 'app.get' function redirects to /memes after logging in, 
if login fails then it redirects to the login page.  
THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION.*/
app.get('/login', function(req, res){
  res.render('login');
  /*This function returns user information in an object named 'user' with parts accessible via 'user.'  If no user is 
  logged in then this function returns a 1. THIS WILL BE USED IN PART 2 */
});

/*The following 'app.get' function redirects to /memes after logging in, 
if login fails then it redirects to the login page.  
THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION.*/
app.get('/auth/google', 
   passport.authenticate('google-openidconnect', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}, { failureRedirect: '/login' }),
/*This function returns user information in an object named 'user' with parts accessible via 'user.'.  If no user is  logged in then this function returns a 1. THIS WILL BE USED IN PART 2 */
  function(req, res) {
    res.redirect('/memes/user');
  });

/*The following 'app.get' function redirects the user to the /memes page 
when a user logs out. THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION.*/
app.get('/auth/google/return', 
  passport.authenticate('google-openidconnect', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/memes/user');
  });

/*The following 'app.get' function redirects the user to the logout page.
THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION.*/
app.get('/logout', function(req, res){
  res.redirect('/memes/logout');
});

/*The following function checks for authentication when trying access 
the web application.  To protect any page, just add 'ensureAuthenticated' 
is in a similar position as in App Function 6. (You won't need to for this lab) */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/*This function(socket.io.on) keeps a list of clients connected to this server.  
After a client connects it adds the client list, when a client disconnects it is 
removed from the client list.  Whenever new information should be pushed to the 
socket, it is sent to all of the connected clients.
THIS WILL BE USED IN PART 2 OF THE LAB, BUT YOU DON'T NEED TO MODIFY THIS FUNCTION. */
io.sockets.on( 'connection', function ( socket ) {
  console.log('Number of connections:' + connectionsArray.length);
  if (!connectionsArray.length) {
    pollingLoop();
  }

//This function is waiting for a signal form the client using the function 'disconnect'
  socket.on('disconnect', function () {  //when "disconnect" detected
    var socketIndex = connectionsArray.indexOf( socket );
    console.log('*******socket = ' + socketIndex + ' disconnected*****'); //print out in console
    if (socketIndex >= 0) {
      connectionsArray.splice( socketIndex, 1 );
    }
  });

/*This function is waiting for a signal from the client using the function 'button_click'.  
This is listening for a socket.io.emit from the client (view i.e. memes.ejs) with the 'button_click' tag. 
THIS WILL BE USED IN PART 2 OF THE LAB. YOU SHOULDN'T HAVE TO CHANGE ANYTHING HERE. */
  socket.on('button_click', function (imageId, buttonId){
    var count;
    Images.find({ where: {imageId: imageId}}) //Find image with correct id
    .then(function(image){
      count = image.numLikes + 1  //Increment likes
      
      image.updateAttributes({numLikes:count}) //Update the database
      .then(function(){
        Images.find({ where: {imageId: imageId}}) //Find updated image
        .then(function(newImage){
          connectionsArray.forEach(function(tmpSocket){
            tmpSocket.volatile.emit('return_click' , newImage, buttonId ); //Send the updated information to all clients (views i.e. memes.ejs) with the 'return_click' function ID.
          });
        })
        .catch(function(err){
          console.log("*******Did not return correct Image Info for updating HTML ********");
		  console.log("****************************************************");
		  console.log(err);
		  console.log("****************************************************");
          callback(err);
        });
      })
      .catch(function(err){
        console.log("******* Could not update! ********");
		console.log("****************************************************");
		console.log(err);
		console.log("****************************************************");
		callback(err);
      });
    })
    .catch(function(err){
      console.log("*******Did not find the correct Image Info ********");
	  console.log("****************************************************");
	  console.log(err);
	  console.log("****************************************************");
      callback(err);
    });
  })
  console.log('****A new socket is connected!*****');
  connectionsArray.push( socket );//Pushes the updates to all clients.
});

/*This function grabs images and users from the database and sends them to the connected clients.
THIS WILL BE USED IN PART 2 OF THE LAB. YOU SHOULDN'T HAVE TO CHANGE ANYTHING HERE.*/
var pollingLoop = function () {
  var query = Images.all(),
    images = [];
  query.catch(function(err){
    console.log("**"+ err +"**");
    updateSockets( err );
  }) 
  .then(function(image){
    for (i=0; i<image.length; i++){
      images.push( image[i] );  //Get images
    }
      var query2 = Users.all(),
        users = [];
      query2.catch(function(err){
        console.log("**"+ err +"**");
        updateSockets( err );
      })
      .then(function(user){
        for (i=0; i<user.length; i++){
          users.push( user[i] ); //Get users
        }
        if(connectionsArray.length) {
          pollingTimer = setTimeout( pollingLoop, POLLING_INTERVAL );
          updateSockets({images:images, users:users}); //Update the socket with new information from database
        }
      });
    });
};

/*The following function updates the time and connections  */
var updateSockets = function ( data ) {
  data.time = new Date();
  connectionsArray.forEach(function( tmpSocket ){
    tmpSocket.volatile.emit( 'notification' , data ); //Emit the updated information, this goes to memes.ejs which is listening for 'notification'
  });
};
