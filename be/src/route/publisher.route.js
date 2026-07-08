const express = require('express');
const router = express.Router();
const { getAllPublishers } = require('../controller/publisher.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.get('/', verifyToken, authorizeRole(['staff', 'admin']), getAllPublishers);

module.exports = router;
