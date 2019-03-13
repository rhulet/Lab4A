/*************************************************************************
FOR PART 1: Fill out this file with Sequelize database connection information.
Make sure that you "export" (make externally available) the resources that
you create in this file. You should need no more than about 4 lines of code
in this file. You should read the documentation referenced on the lab specs
before attempting to create this connection file. If you took IT210A, this 
will be similar to the database connection file you made for PHP in Lab 3.
**************************************************************************/

let Sequelize = require('sequelize');

let sequelize = new Sequelize('it210b', 'webadmin', 'zxcfrewQ1!', {
    host: 'http://nodejs.rhulet34.it210.it.et.byu.edu/',
    dialect: 'mysql'
})

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;