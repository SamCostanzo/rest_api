// Routes for Courses
const express = require('express');
const router = express.Router();
const { Course } = require('../models');


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


// GET /api/courses - 200 - Returns a list of courses (including the user that owns each course) - DONE
router.get('/courses', asyncHandler(async (req, res) => {
    const course = await Course.findAll();
    res.json(course);
    res.status(200).end();
}));

// MIGHT need to add this above from Emmett
// const course = await Course.findAll({
//   include: [{ model: User, as: "user" }]
// });

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID - DONE
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    res.json(course);
    res.status(200).end();
}));



// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', asyncHandler(async (req, res) => {
  const course = await Course.create(req.body); // Create a new course with the request's body
  res.status(201).location('/courses/:id').end(); // Set status code and location and ends the response
}));


// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id); // Find that course
  if (!course) res.status(404).send('The course with the given ID was not found'); // Make sure that course exsists 
  course.update(req.body); // Update the course with the new request body
  res.status(204).end(); // If no errors, set the status to 204 and end response
}));



// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id); // Find that course
  await course.destroy(); // Delete that course
  res.status(204).end(); // Set status code and end response
}));


module.exports = router;