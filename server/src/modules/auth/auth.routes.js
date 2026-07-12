const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { loginSchema, registerSchema, changePasswordSchema } = require('./auth.validation');

const router = express.Router();

// Public routes
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// Protected routes (require JWT)
router.get('/profile', authenticate, authController.getProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
