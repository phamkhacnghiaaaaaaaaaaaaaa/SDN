const express = require("express");
const router = express.Router();
const {
  getFavouriteCountByBookId,
  getFavouritesByUser,
  toggleFavourite,
} = require("../controller/favourites.controller");
const { verifyToken } = require("../middleware/auth");

router.get("/count", getFavouriteCountByBookId); // tất cả
router.get("/count/:bookId", getFavouriteCountByBookId);
router.get("/my-favourites", verifyToken, getFavouritesByUser);
router.post("/toggle", verifyToken, toggleFavourite);

module.exports = router;
