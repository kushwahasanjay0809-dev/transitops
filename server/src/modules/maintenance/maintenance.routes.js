const express = require('express');
const maintenanceController = require('./maintenance.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createMaintenanceSchema, updateMaintenanceSchema, maintenanceQuerySchema } = require('./maintenance.validation');

const router = express.Router();

router.use(authenticate);

// Read — all authenticated users
router.get('/', validate(maintenanceQuerySchema, 'query'), maintenanceController.list);
router.get('/stats', maintenanceController.getStats);
router.get('/:id', maintenanceController.getById);

// Write — ADMIN and MANAGER only
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createMaintenanceSchema), maintenanceController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateMaintenanceSchema), maintenanceController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), maintenanceController.delete);

module.exports = router;
