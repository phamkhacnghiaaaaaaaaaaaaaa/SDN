const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controller/setting.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.get('/', getSettings);
router.patch('/', verifyToken, authorizeRole('Admin'), updateSettings);

module.exports = router;
