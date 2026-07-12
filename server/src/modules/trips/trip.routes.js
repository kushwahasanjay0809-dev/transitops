const express = require('express');
const tripController = require('./trip.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const {
  createTripSchema,
  updateTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  cancelTripSchema,
  tripQuerySchema,
} = require('./trip.validation');

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// Read-only routes — all authenticated users
router.get('/', validate(tripQuerySchema, 'query'), tripController.list);
router.get('/stats', tripController.getStats);
router.get('/:id', tripController.getById);

// Create & Update — ADMIN, MANAGER, DISPATCHER
router.post('/', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(createTripSchema), tripController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(updateTripSchema), tripController.update);

// Lifecycle actions — ADMIN, MANAGER, DISPATCHER
router.patch('/:id/dispatch', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(dispatchTripSchema), tripController.dispatch);
router.patch('/:id/start', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), tripController.startTrip);
router.patch('/:id/complete', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(completeTripSchema), tripController.complete);
router.patch('/:id/cancel', authorize('ADMIN', 'MANAGER', 'DISPATCHER'), validate(cancelTripSchema), tripController.cancel);

// Delete — ADMIN and MANAGER only
router.delete('/:id', authorize('ADMIN', 'MANAGER'), tripController.delete);

module.exports = router;
