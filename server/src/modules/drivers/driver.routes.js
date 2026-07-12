const express = require('express');
const driverController = require('./driver.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createDriverSchema, updateDriverSchema, driverQuerySchema } = require('./driver.validation');

const router = express.Router();

// All driver routes require authentication
router.use(authenticate);

// Read-only routes — all authenticated users
router.get('/', validate(driverQuerySchema, 'query'), driverController.list);
router.get('/available', driverController.getAvailable);
router.get('/stats', driverController.getStats);
router.get('/:id', driverController.getById);

// Write routes — ADMIN and MANAGER only
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createDriverSchema), driverController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateDriverSchema), driverController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), driverController.delete);

module.exports = router;
