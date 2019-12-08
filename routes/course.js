// Routes for Courses
const express = require('express');
const router = express.Router();
const { Course } = require('../models');
const { User } = require('../models');
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


// GET COURSES

// GET /api/courses - 200 - Returns a list of courses (including the user that owns each course) - DONE
router.get('/courses', asyncHandler(async (req, res) => {
    // const course = await Course.findAll();
    const course = await Course.findAll({
      include: [User]
    });
    res.json(course);
    res.status(200).end();
}));


// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID - DONE
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      include: [User]
    });
    res.json(course);
    res.status(200).end();
}));




// POST, PUT, DELETE COURSES

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', authenticateUser, asyncHandler(async (req, res, next) => {
  
  if(Object.keys(req.body).length > 0){ // Checks that there is any data at all to work with
    try{
      const course = await Course.create(req.body); // Create a new course with the request's body
      res.status(201).location('/courses/' + course.id).end(); // Set status code and location and ends the response
    } catch(error) {
      if(error.name === 'SequelizeValidationError'){
        error.status = 400;
        next(error);
      } else {
        throw error;
      }
    }
  } else {
    new Error().status(400);
  }
}));




// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id); // Find that course
    // if (!course) res.status(404).send('The course with the given ID was not found'); // Make sure that course exsists 
    if (req.body.title && req.body.description) {
      course.update(req.body); // Update the course with the new request body
      await res.status(204).end(); // If no errors, set the status to 204 and end response
    } else {
      res.status(400).json({ message: "Please enter a title and/or description" });
    }
  } catch(error){
    res.status(400).json({ message: error.message });
  }
}));





// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id); // Find that course
  await course.destroy(); // Delete that course
  res.status(204).end(); // Set status code and end response
}));


module.exports = router;








