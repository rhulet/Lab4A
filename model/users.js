/*********************************************************
This model relates to the 'users' table in your database
*********************************************************/
var	db = require('../db');
var sequelize = db.sequelize;
var Sequelize = db.Sequelize;

var Users = sequelize.define('users', {
	userId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	userName: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	loggedIn: Sequelize.INTEGER
})

module.exports = Users; //this exports the model from this page to whatever page imports it
