const express = require('express');
const userController = require('./user.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { createUserSchema, updateUserSchema, userQuerySchema } = require('./user.validation');

const router = express.Router();

// All user management routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/users/roles — Get all roles (for dropdowns)
router.get('/roles', userController.getRoles);

// GET /api/users — List users with pagination
router.get('/', validate(userQuerySchema, 'query'), userController.list);

// GET /api/users/:id — Get single user
router.get('/:id', userController.getById);

// POST /api/users — Create user
router.post('/', validate(createUserSchema), userController.create);

// PUT /api/users/:id — Update user
router.put('/:id', validate(updateUserSchema), userController.update);

// DELETE /api/users/:id — Delete user
router.delete('/:id', userController.delete);

module.exports = router;
