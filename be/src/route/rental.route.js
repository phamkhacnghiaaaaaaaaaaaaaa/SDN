const express = require('express');
const router = express.Router();
const { getAllRentals, createRental, updateRentalStatus } = require('../controller/rental.controller');

router.get('/', getAllRentals);
router.post('/', createRental);
router.patch('/:id/status', updateRentalStatus);

module.exports = router;
