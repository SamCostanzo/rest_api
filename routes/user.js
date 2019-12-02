// Routes for Users
const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Require the user model from the models folder
const bcryptjs = require('bcryptjs'); // Package for password hashing

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


// Returns the currently authenticated user - 200 - PH - For now it just returns all the users - NEEDS WORK
router.get('/users', asyncHandler(async (req, res) => {
    const user = await User.findAll();
    res.json(user);
    res.status(200).end();
}));



// Creates a user, sets the location header to '/', and returns no content - 201 - DONE I THINK
router.post('/users', asyncHandler(async (req, res) => {
    const user = await User.create(req.body); // Create a new user with the requests body
    user.password = bcryptjs.hashSync(user.password); // Hash the new users password
    res.status(201).location('/').end(); // Sets the status code, location, and then ends the response
}));


 module.exports = router;





 // User authenticate starting code for now


 // Maybe put before routes
//  const authenticateUser = asyncHandler(async (req, res, next) => {
//   let message = null;

//   const credentials = auth(req);

//   if (credentials) {
//     const user = await User.findOne({
//       where: {
//         emailAddress: credentials.name
//       }
//     });

//     if (user) {
//       const authenticated = bcryptjs.compareSync(
//         credentials.pass,
//         user.password
//       );
//       if (authenticated) {
//         console.log(
//           `Authentication successful for username: ${user.emailAddress}`
//         );

//         req.currentUser = user;
//       } else {
//         message = `Authentication failure for username: ${user.emailAddress}`;
//       }
//     } else {
//       message = `User not found for username: ${credentials.name}`;
//     }
//   } else {
//     message = "Auth Header not found";
//   }
//   if (message) {
//     console.warn(message);
//     res.status(401).json({ message: "Access Denied" });
//   } else {
//     next();
//   }
// });