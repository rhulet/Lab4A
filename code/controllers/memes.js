/***************************************************************************
This controller manages every view that will go through the path /memes/.
If you were to create additional pages, for example /test/hello/ or /test/hi/
you can route those to the correct views.  These various controllers can all
access the database and that information can be processed by each individual 
controller in this file. 
***************************************************************************/
var cu = require('../utility/controller_utilities'); // This imports the utilities in the /utilities/controller_utilities.js file.
var render_function = cu.new_render_function; //This allows you to use the render functions from express for rendering a HTML page.
var redirect_function = cu.new_redirect_function; //This allows you to use the redirect functions from express for rendering a HTML page.
var async = require('async'); //This package allows for asynchronous function calls, helping to streamline the the dataflow for this app.
var images = require('../model/images'); // This imports the information from the images table in the database.
var Images = images.Images; //This allows the information from the images table in the database to be used on this page.
var users = require('../model/users'); // This imports the information from the users table in the database.
var Users = users.Users; //This allows the information from the users table in the database to be used on this page.
var db = require('../db'); //This imports the database connection and makes it usable by this page.
var sequelize = db.sequelize; //This imports the the sequelize package to utilize in querying the database for information.
var Sequelize = db.Sequelize; //This imports the the Exact database connection information from db.js


/* This is the router for the controller.  It takes a path /memes, routes it to the 
render function 'memes' and then exports.memes exports the returned data for use in 
other controllers if needed.*/
exports.setup = function(app){
    app.get('/memes', render_function('memes', exports.memes));
/*DO WORK BELOW, ADD TO THE FUNCTION FOR PART 1!  Here you will need to add another controller for dynamic routing 
according to a users ID, for example, you will need to use a route for something like /memes/UserID/view.  You can access parameters in 
the URL by using something like '/:id/' where the : indicates that 'id' is a variable that you can then access by using req.params.id*/
	
    //Uncomment and fix the next line
    //app.get('', render_function('', exports.views));
    
    app.get('/memes/user', redirect_function('/memes', exports.users));
    app.get('/memes/logout', redirect_function('/memes', exports.logout));
};

/* This is the function called by the router.  This is the actual controller
for the app.  It manages the data for this specific page*/
exports.memes = function(req, res,callback){ //Function exports.views will be almost exactly the same as this function, with additional filtering (images for only one user).
	async.auto({
		getData: function get_data(callback){
			Images.all() //Function returns information for all images.  Similar to 'select * from images;'
				.then(function(getData){
					callback(null, getData); //On a successful query the results are returned in the object 'getData'
				})
				.catch(function(err){
					console.log("*******Did not return Image Info ********");
					callback(err);
				});
		},
		getUser: function get_user(callback){
			Users.all() //Function returns information for all users.  Similar to 'select * from users;'
				.then(function(getUser){
					callback(null, getUser); //On a successful query the results are returned in the object 'getUser'
				})
				.catch(function(err){
					console.log("*******Did not return Comment Info ********");
					callback(err);
				});
		},
		verifyUser: function verify_user(callback){
			/* The below if statement checks if authentication through Google has been done.  
			If someone is logged in, Google returns an object (see documentation in references)
			If not, it returns a 1 instead of user information.
			Use this for displaying the users displayName or a guest user welcome in Part 2. */
			if(typeof req.user === 'undefined'){
				req.user = 1;
			}
			callback(null, req.user);
		}
	},
	function done(err, results){
		callback({
			userList: results.getUser, //This returns a list/array of information about the users accessible via userList in memes.ejs
			imageList : results.getData, //This returns a list/array of information about the images accessible via imageList in memes.ejs
			user: results.verifyUser, //This returns a user object or a 1, accessible via user in memes.ejs.  It is recommend you use console.log or console.dir to view what information requested from Google.
		});
	});
}

/* Do WORK IN THE FUNCTION BELOW FOR PART 1! You will insert a controller below for the new function that
 you are creating to manage a view for a specified user.  The easiest way to do this is to 
 pass the userId of the user that they clicked on to the URL and then use req.params.id 
 to get that parameter from the URL.  This function will be almost exactly the same as the function above
 called exports.memes, except for using the req.params.id to filter which images should be displayed on the page */

exports.views = function(req, res,callback){

}




/* This function checks when a user logs in to see if the user already has an account.  If the
user does not have an account, a new account is created in the database using the 
credentials that Google passes it when the user logs in.  If the user already exists, 
that user is simply marked as logged into the website. */
exports.users = function(req, res, callback){

	Users.all()
		.then(function(getUsers){
			var exists = false;

			for (k=0; k<getUsers.length; k++){
				if (getUsers[k].email === req.user._json.email){
					exists = true;
					Users.update({loggedIn : 1}, ({where: ["email=?", req.user._json.email]}))
					.then(function(){})
					.catch(function(err){
						console.log("*******Did not login the User ********");
						callback(err);
					});
				}
			}
			if(!exists){
				Users.create({
					userName: req.user.name.givenName,
					email: req.user._json.email,
					password: "98765432109876543210987654321",
					loggedIn: 1,
				})
				.then(function(){})
				.catch(function(err){
					console.log("*******Did not create the new User ********");
					callback(err);
				});
			}
		})
		.catch(function(err){
			console.log("*******Did not return Users Info ********");
			callback(err);
		});
	callback();
}

/* This function processes data in the database, destroys the session/cookie, and marks the user as logged out when a user logs out of the website. */
exports.logout = function(req, res, callback){
	if (req.user === 'undefined'){
	}
	else{
		Users.update({loggedIn : 0}, ({where: ["email=?", req.user._json.email]}))
		.then(function(){
		  	req.logout(); //This detroys a users current session when they logout of the website.
			callback();
		})
		.catch(function(err){
			console.log("*******Could not update user to logged out********");
			callback(err);
		});
	}
}


/*The following function checks for authentication when trying to access the web application.  To protect any page, just add 
'ensureAuthenticated' in a similar position as in App Function 1 in server.js. You probably don't need to */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
