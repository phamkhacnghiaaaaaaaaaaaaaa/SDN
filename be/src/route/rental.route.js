const express = require('express');
const router = express.Router();
const { getAllRentals, createRental, updateRentalStatus, deleteRental } = require('../controller/rental.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', getAllRentals);
router.post('/',verifyToken, createRental);
router.patch('/:id/status', updateRentalStatus);
router.delete('/:id', deleteRental);

module.exports = router;
