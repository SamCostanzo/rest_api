// Routes for Users
const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Require the user model from the models folder
const bcryptjs = require('bcryptjs'); // Package for password hashing
const auth = require('basic-auth'); // Package for authentication 

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
        console.log(error);
      }
    };
  }

  // Authenticate a user
  const authenticateUser = asyncHandler(async (req, res, next) => {
    // Declare a message varible to be filled in below
    let message = null;
  
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
    console.log(credentials);
    
    // If the user's credentials are available...
    if (credentials) {
      
      // Attempt to retrieve the user from the database by their username (i.e. the user's "key" from the Authorization header).
      const user = await User.findOne({
        where: {
          emailAddress: credentials.name,
        }
      });

      // If a user was successfully retrieved from the data store...
      if (user) {
        // Use the bcryptjs npm package to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
  
        // If the passwords match...
        if (authenticated) {
          console.log(`Authentication successful for username: ${user.emailAddress}`);
  
          // Then store the retrieved user object on the request object so any middleware functions that follow this middleware function will have access to the user's information.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
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
      res.status(401).json({ message: message });
    } else {
      // Or if user authentication succeeded...
      // Call the next() method.
      next();
    }
  });




// Returns the currently authenticated user - 200 
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
    res.status(200).json({
      emailAddress: user.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    }).end();
}));



// Creates a user. Checks for info and hashes PW
router.post("/users", asyncHandler(async (req, res) => {
  const user = req.body;
    try {
      if (user.password) {
        user.password = bcryptjs.hashSync(user.password);
      }

      await User.create(user);
      res.status(201).location('/').end();
    } catch (error) {
      res.status(400).json({ message: "Please Enter your name, email and password", error });
    }
  })
);



module.exports = router;




// Old way of creating user - Keeping for now if needed

// && req.body.firstName && req.body.lastName && req.body.emailAddress && req.body.password
// Creates a new user. First checks to see if there is any data to work with, then hashes PW in the try block.
// router.post('/users', asyncHandler(async (req, res, next) => {

//   if(Object.keys(req.body).length > 0){ // Checks that there is any data at all to work with
//     try{
//       req.body.password = bcryptjs.hashSync(req.body.password); // Hash the new users password
//       const user = await User.create(req.body); // Create a new user with the requests body
//       res.status(201).location('/').end(); // Sets the status code, location, and then ends the response
//     } catch(error) {
//       if(error.name === 'SequelizeValidationError'){
//         error.status = 400;
//         next(error);
//       } else {
//         throw error;
//       }
//     }
//   } else {
//     new Error().status(400);
//     console.log(error);
//   }
// }));