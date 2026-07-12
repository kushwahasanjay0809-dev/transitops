const express = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// Dashboard is read-only — any authenticated user can view
router.get('/', authenticate, dashboardController.getDashboard);

module.exports = router;
