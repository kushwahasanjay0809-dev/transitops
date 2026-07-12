const express = require('express');
const fuelController = require('./fuel.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createFuelLogSchema, updateFuelLogSchema, fuelLogQuerySchema } = require('./fuel.validation');

const router = express.Router();

router.use(authenticate);

// Read — all authenticated users
router.get('/', validate(fuelLogQuerySchema, 'query'), fuelController.list);
router.get('/stats', fuelController.getStats);
router.get('/:id', fuelController.getById);

// Write — ADMIN, MANAGER, DISPATCHER
router.post('/', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(createFuelLogSchema), fuelController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(updateFuelLogSchema), fuelController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), fuelController.delete);

module.exports = router;
