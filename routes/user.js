// Routes for Users
const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Require the user model from the models folder
const bcryptjs = require('bcryptjs'); // Package for password hashing
const auth = require('basic-auth');

// set up parsing
router.use(express.json());
router.use(express.urlencoded({ extended: false }));


// Handler function to wrap each route. 
function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        res.status(500).send(error);
      }
    };
  }


  const authenticateUser = (req, res, next) => {
    let message = null;
  
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
    console.log(credentials);
    
    // If the user's credentials are available...
    if (credentials) {
      // Attempt to retrieve the user from the database by their username (i.e. the user's "key" from the Authorization header).
      // const user = users.find(u => u.username === credentials.name); // emailAddress or username??? 
      const user = User.find(u => u.username === credentials.name);
      
      // If a user was successfully retrieved from the data store...
      if (user) {
        // Use the bcryptjs npm package to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
  
        // If the passwords match...
        if (authenticated) {
          console.log(`Authentication successful for username: ${user.username}`);
  
          // Then store the retrieved user object on the request object so any middleware functions that follow this middleware function will have access to the user's information.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.username}`;
        }
      } else {
        message = `User not found for username: ${credentials.name}`;
      }
    } else {
      message = 'Auth header not found';
    }
  
    // If user authentication failed...
    if (message) {
      console.warn(message);
  
      // Return a response with a 401 Unauthorized HTTP status code.
      res.status(401).json({ message: 'Access Denied' });
    } else {
      // Or if user authentication succeeded...
      // Call the next() method.
      next();
    }
  };





  

// Returns the currently authenticated user - 200 - PH - For now it just returns all the users - NEEDS WORK
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    // const user = await User.findAll();
    // res.json(user);
    
    const user = req.currentUser;

    res.json({
      name: user.name,
      username: user.username,
    });
    
    res.status(200).end();
}));



// Creates a user, sets the location header to '/', and returns no content - 201 - DONE I THINK
router.post('/users', asyncHandler(async (req, res) => {
    const user = await User.create(req.body); // Create a new user with the requests body
    user.password = bcryptjs.hashSync(user.password); // Hash the new users password
    res.status(201).location('/').end(); // Sets the status code, location, and then ends the response
}));


 module.exports = router;




