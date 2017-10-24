/*********************************************************
This model relates to the 'cross_server_keys' table in your database
*********************************************************/
var	db = require('../db');
var sequelize = db.sequelize;
var Sequelize = db.Sequelize;

var CSKeys = sequelize.define('cross_server_keys', {
	csk_index: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	uuid: Sequelize.STRING,
	email: Sequelize.STRING,
})

module.exports = CSKeys; //this exports the model from this page to whatever page imports it
