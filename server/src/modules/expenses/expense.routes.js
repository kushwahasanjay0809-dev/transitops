const express = require('express');
const expenseController = require('./expense.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } = require('./expense.validation');

const router = express.Router();

router.use(authenticate);

// Read — all authenticated users
router.get('/', validate(expenseQuerySchema, 'query'), expenseController.list);
router.get('/stats', expenseController.getStats);
router.get('/:id', expenseController.getById);

// Write — ADMIN and MANAGER only
router.post('/', authorize('ADMIN', 'MANAGER'), validate(createExpenseSchema), expenseController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(updateExpenseSchema), expenseController.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), expenseController.delete);

module.exports = router;