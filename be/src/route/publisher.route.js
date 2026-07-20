const express = require('express');
const router = express.Router();
const {
    getAllPublishers,
    getPublisherById,
    createPublisher,
    updatePublisher,
    deletePublisher
} = require('../controller/publisher.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.get('/', getAllPublishers);
router.get('/:id', getPublisherById);
router.post('/', verifyToken, authorizeRole('Admin'), createPublisher);
router.put('/:id', verifyToken, authorizeRole('Admin'), updatePublisher);
router.delete('/:id', verifyToken, authorizeRole('Admin'), deletePublisher);

module.exports = router;
