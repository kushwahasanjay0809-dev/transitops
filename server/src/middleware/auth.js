const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/appError');

/**
 * JWT Authentication Middleware.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded user payload to req.user.
 */
function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw AppError.unauthorized('No authorization token provided');
    }

    // Expect "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw AppError.unauthorized('Invalid authorization format. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, env.jwtSecret);

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token has expired. Please login again.'));
    }
    next(error);
  }
}

/**
 * Optional authentication middleware.
 * Attaches user if token is valid, but doesn't fail if missing.
 * Useful for endpoints that behave differently for logged-in users.
 */
function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const decoded = jwt.verify(parts[1], env.jwtSecret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
    };
  } catch {
    // Token invalid — proceed without user
  }
  next();
}

module.exports = { authenticate, optionalAuth };
