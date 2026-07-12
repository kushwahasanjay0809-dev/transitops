const express = require('express');
const vehicleController = require('./vehicle.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema } = require('./vehicle.validation');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

// Read-only routes — all authenticated users
router.get('/', validate(vehicleQuerySchema, 'query'), vehicleController.list);
router.get('/available', vehicleController.getAvailable);
router.get('/stats', vehicleController.getStats);
router.get('/:id', vehicleController.getById);

// Write routes — ADMIN and MANAGER only
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createVehicleSchema), vehicleController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), vehicleController.delete);

module.exports = router;
