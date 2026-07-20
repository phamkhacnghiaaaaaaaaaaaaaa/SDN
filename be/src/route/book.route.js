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

// --- ROUTES CÔNG KHAI (Ai cũng xem được) ---
router.get("/search", searchBook);
router.get("/available/:id", getAvailableQuantityByBookId);
router.get("/", getAllBooks);

// --- ROUTES CẦN ĐĂNG NHẬP ---
router.get("/:id", verifyToken, getBookById);

// --- ROUTES STAFF / ADMIN ---
router.post("/", authorizeRole("Staff", "Admin"), createBook);
router.put("/:id", authorizeRole("Staff", "Admin"), updateBook);
router.delete("/:id", authorizeRole("Staff", "Admin"), deleteBook);

// --- ROUTES YÊU CẦU ĐĂNG NHẬP (Cần biết bạn là ai) ---
router.get("/:id", verifyToken, getBookById);

// --- ROUTES QUYỀN CAO (Cần biết bạn là ai VÀ bạn có quyền gì) ---
// Quy tắc: verifyToken luôn đứng TRƯỚC authorizeRole
router.post("/", verifyToken, authorizeRole("Staff", "Admin"), createBook);
router.put("/:id", verifyToken, authorizeRole("Staff", "Admin"), updateBook);
router.delete("/:id", verifyToken, authorizeRole("Staff", "Admin"), deleteBook);

module.exports = router;
