// Routes for Users
const express = require('express');
const router = express.Router();
const { User } = require('../models');


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


// Returns the currently authenticated user - 200 - PH - For now it just returns all the users
router.get('/users', asyncHandler(async (req, res) => {
    const user = await User.findAll();
    res.json(user);
    res.status(200).end();
}));



// Creates a user, sets the location header to '/', and returns no content - 201
router.post('/users', asyncHandler(async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).end();
}));


 module.exports = router;