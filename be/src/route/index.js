const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const bookRoute = require("./book.route");
const rentalRoute = require("./rental.route");
const authorRoute = require("./author.route");
const categoryRoute = require("./category.route");
const favouriteRoute = require("./favourites.routes");
const readingProgressRoute = require("./reading_progress.route");

// Models for registration (populate support)
require("../model/user.model");
require("../model/book.model");
require("../model/category.model");
require("../model/author.model");
require("../model/publisher.model");
require("../model/rental.model");
require("../model/favourite.model");
require("../model/reading_progress.model");
require("../model/favourite.model");

router.use("/users", userRoute);
router.use("/books", bookRoute);
router.use("/rentals", rentalRoute);
router.use("/authors", authorRoute);
router.use("/favourites", favouriteRoute);
router.use("/categories", categoryRoute);
router.use("/reading-progress", readingProgressRoute);

module.exports = router;
