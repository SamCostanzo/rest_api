'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const user = require('./routes/user'); // Route file
const course = require('./routes/course'); // Route file


const sequelize = require('./models').sequelize; // import Sequelize

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));
app.use(express.json());

// Middleware to use the two routes files
app.use('/api', user);
app.use('/api', course);


// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});


// Global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  if(err.name === 'SequelizeValidationError'){
    err.status = 400;
    err.message = err.errors.map(err => err.message);
  }

  res.status(err.status || 500).json({
    message: err.message,
  });
});



// Server port
app.set('port', process.env.PORT || 5000); 


// Test database connection
(async () => { 
  try {
    await sequelize.authenticate();
    console.log("Connection to the database successful!");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
})();


// start listening on our port, and sync the models when the server starts.
sequelize.sync().then(() => {
  const server = app.listen(app.get('port'), () => {
    console.log(`Express server is listening on port ${server.address().port}...`);
  });
});

