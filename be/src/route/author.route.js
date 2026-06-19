const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } = require('../controller/author.controller');

router.get('/', getAllAuthors);
router.get('/:id', getAuthorById);
router.post('/', verifyToken, authorizeRole('Admin'), createAuthor);
router.put('/:id', verifyToken, authorizeRole('Admin'), updateAuthor);
router.delete('/:id', verifyToken, authorizeRole('Admin'), deleteAuthor);

module.exports = router;
