const express = require('express');
const regionController = require('./region.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createRegionSchema, updateRegionSchema, regionQuerySchema } = require('./region.validation');

const router = express.Router();

router.use(authenticate);

// Read — all authenticated users
router.get('/', validate(regionQuerySchema, 'query'), regionController.list);
router.get('/all', regionController.getAll);
router.get('/:id', regionController.getById);

// Write — ADMIN and MANAGER only
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createRegionSchema), regionController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateRegionSchema), regionController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), regionController.delete);

module.exports = router;
