const express = require("express");
const router = express.Router();
const { getReadingProgressByUser } = require("../controller/reading_progress.controller");
const { verifyToken } = require("../middleware/auth");

router.get("/my-progress", verifyToken, getReadingProgressByUser);

module.exports = router;
