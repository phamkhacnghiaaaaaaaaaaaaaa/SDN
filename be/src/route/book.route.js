const express = require("express");
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAvailableQuantityByBookId,
  searchBook,
} = require("../controller/book.controller");
const { verifyToken, authorizeRole } = require("../middleware/auth");

router.get("/search", searchBook);
router.get("/available/:id", getAvailableQuantityByBookId);
router.get("/", getAllBooks);
router.get("/:id", verifyToken, getBookById);
router.post("/", authorizeRole('Staff', 'Admin'), createBook);
router.put("/:id",authorizeRole('Staff', 'Admin'), updateBook);
router.delete("/:id",authorizeRole('Staff', 'Admin'), deleteBook);

module.exports = router;
