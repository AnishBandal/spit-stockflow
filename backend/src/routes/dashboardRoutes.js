const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/stats', auth, dashboardController.getStats);
router.get('/move-history', auth, dashboardController.getMoveHistory);

module.exports = router;
