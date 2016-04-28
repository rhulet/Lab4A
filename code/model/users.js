/*********************************************************
This model connects to the 'users' table in your database.
*********************************************************/

var	db = require('../db'), //This imports the database connection and makes it usable by this page.
  	sequelize = db.sequelize, //This imports the sequelize package to utilize in querying the database for information.
  	Sequelize = db.Sequelize; //This imports the exact database connection information from db.js for information.

/*The following function creates the users table in the database if the table does not exist.  A data precautionary step.*/
var Users = sequelize.define('users', {
	userId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	userName: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	loggedIn: Sequelize.INTEGER
});


exports.Users = Users; //This exports the data from the the users table in the database for use in controllers.
