const express = require('express');
const router = express.Router();
const { getAllRentals, createRental, updateRentalStatus, deleteRental } = require('../controller/rental.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const {
    getAllRentalsByStaff,
    createRentalByStaff,
    updateRentalByStaff,
    updateStatusByStaff,
    deleteRentalByStaff,
    extendRental
} = require('../controller/rental.staff.controller');

// User routes
router.get('/', getAllRentals);
router.post('/', verifyToken, createRental);
router.patch('/:id/status', verifyToken, updateRentalStatus);
router.delete('/:id', verifyToken, deleteRental);

// Staff routes
router.get('/staff/all', verifyToken, authorizeRole('Staff', 'Admin'), getAllRentalsByStaff);
router.post('/staff/create', verifyToken, authorizeRole('Staff', 'Admin'), createRentalByStaff);
router.patch('/staff/:id', verifyToken, authorizeRole('Staff', 'Admin'), updateRentalByStaff);
router.patch('/staff/:id/status', verifyToken, authorizeRole('Staff', 'Admin'), updateStatusByStaff);
router.patch('/staff/:id/extend', verifyToken, authorizeRole('Staff', 'Admin'), extendRental);
router.delete('/staff/:id', verifyToken, authorizeRole('Staff', 'Admin'), deleteRentalByStaff);


module.exports = router;
