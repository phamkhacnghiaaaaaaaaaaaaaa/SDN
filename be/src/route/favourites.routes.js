const express = require("express");
const router = express.Router();
const {
  getFavouriteCountByBookId,
} = require("../controller/favourites.controller");

router.get("/", getFavouriteCountByBookId); // tất cả
router.get("/:bookId", getFavouriteCountByBookId); // một sách

module.exports = router;
