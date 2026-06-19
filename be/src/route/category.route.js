const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middleware/auth");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/category.controller");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", verifyToken, authorizeRole("Admin"), createCategory);
router.put("/:id", verifyToken, authorizeRole("Admin"), updateCategory);
router.delete("/:id", verifyToken, authorizeRole("Admin"), deleteCategory);

module.exports = router;
