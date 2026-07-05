const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAvailableQuantityByBookId,
} = require("../controller/book.controller");

const { verifyToken, authorizeRole } = require("../middleware/auth");

// Public
router.get("/", getAllBooks);
router.get("/available/:id", getAvailableQuantityByBookId);

// Protected
router.get("/:id", verifyToken, getBookById);

// Staff/Admin
router.post("/", authorizeRole("Staff", "Admin"), createBook);
router.put("/:id", authorizeRole("Staff", "Admin"), updateBook);
router.delete("/:id", authorizeRole("Staff", "Admin"), deleteBook);

module.exports = router;
