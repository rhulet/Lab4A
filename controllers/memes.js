/***************************************************************************
These controllers manage the data behind each view within the /memes path.
***************************************************************************/

/* Import needed dependencies */
var Q = require('q'); //Q gives us some Promise helper functions

var Images = require('../model/images'); //allows us to access the images table from the database
var Users = require('../model/users'); //allows us to access the users table from the database
var CSKeys = require('../model/cskeys'); //allows us to access the cross server keys table from the database

/* This generates the data for the /memes route. It is called by the '/memes' route
in the server.js page. The '/memes' route then passes this data to the render function */
exports.getMemeData = function (req){
	return Q.all([
		Images.findAll({where : {uploaded: 1}}),
		Users.all({raw: true})
	]).then(function (results){
		if(!req.user) req.user = 1;

		var images = results[0];
		var users = results[1];

		//we only need the user name from the Users results
		for(var i = 0, len = images.length; i < len; i++){
			for(var j = 0, len2 = users.length; j < len2; j++){
				if (images[i].userId === users[j].userId){
					images[i].userName = users[j].userName;
					break;
				}
			}
		}
		return {
			imageList : images, //the array of images, accessible via imageList in memes.ejs
			user: req.user //the user object or a 1, accessible via user in memes.ejs
		}
	}).catch(function (err){
		console.error('getMemeData() error', err)
	})
}

/* DO WORK IN THE FUNCTION BELOW FOR PART 1!
 Create the controller below for the views page that will manage a view for a specified user.
 This function will be almost the same as the getMemeData function above, except for filtering
 the images returned by the specific user passed through the URL */
 exports.getViewData = function (req){
	return Q.all([
		Images.findAll({where : {userId: req.params.UserId}}),
		Users.findAll({where : {userId: req.params.UserId}})
	]).then(function (results){
		if(!req.user) req.user = 1;

		var images = results[0];
		var users = results[1];

		//we only need the user name from the Users results
		for(var i = 0, len = images.length; i < len; i++){
			for(var j = 0, len2 = users.length; j < len2; j++){
				if (images[i].userId === users[j].userId){
					images[i].userName = users[j].userName;
					break;
				}
			}
		}
		return {
			imageList : images, //the array of images, accessible via imageList in memes.ejs
			user: req.user //the user object or a 1, accessible via user in memes.ejs
		}
	}).catch(function (err){
		console.error('getViewData() error', err)
	})
 }

/* When a user logs in using Google, userLogin checks if the user exists in the database.
If the user does not exist, a new entry is created in the database using the
credentials that Google gives us. If the user already exists, the user is
simply marked as logged into the website. */
exports.userLogin = function (req){
	return Users.findAll({where : {email: req.user._json.email}}).then(function (result){
		if(result.length){
			req.user.isAdmin = result[0].dataValues.isAdmin;
			return Users.update({loggedIn : 1}, ({where: ["email=?", req.user._json.email]}))
		}else{
			return Users.create({
				userName: req.user.name.givenName,
				email: req.user._json.email,
				password: "98765432109876543210987654321",
				loggedIn: 1
			})
		}
	}).catch(function (err){
		console.error('userLogin() error', err)
	})
}

exports.logout = function (req){
	if (!req.user) return //make sure there is a user logged in

	Users.update({loggedIn : 0}, ({where: ["email=?", req.user._json.email]})); //mark user as logged out
	CSKeys.destroy({where : {email: req.user._json.email}}); //clean up cross server keys
	req.logout(); //destroys the current session
}
