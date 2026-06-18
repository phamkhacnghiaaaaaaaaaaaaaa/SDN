const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require('../controller/book.controller');

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
