const express = require('express');
const router = express.Router();
const { getAllRentals, createRental, updateRentalStatus, deleteRental } = require('../controller/rental.controller');

router.get('/', getAllRentals);
router.post('/', createRental);
router.patch('/:id/status', updateRentalStatus);
router.delete('/:id', deleteRental);

module.exports = router;
