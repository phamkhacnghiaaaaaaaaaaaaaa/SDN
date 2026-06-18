const express = require('express');
const router = express.Router();

const userRoute = require('./user.route');
const bookRoute = require('./book.route');
const rentalRoute = require('./rental.route');

// Models for registration (populate support)
require('../model/user.model');
require('../model/book.model');
require('../model/category.model');
require('../model/author.model');
require('../model/publisher.model');
require('../model/rental.model');
require('../model/favourite.model');
require('../model/reading_progress.model');

router.use('/users', userRoute);
router.use('/books', bookRoute);
router.use('/rentals', rentalRoute);

module.exports = router;
