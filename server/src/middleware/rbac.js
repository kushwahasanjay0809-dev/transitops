const AppError = require('../utils/appError');

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Restricts access to users with specific roles.
 *
 * @param  {...string} allowedRoles - Role names that are allowed (e.g., 'ADMIN', 'MANAGER')
 * @returns {import('express').RequestHandler}
 *
 * @example
 * // Only admins can access
 * router.get('/users', authenticate, authorize('ADMIN'), userController.list);
 *
 * // Admins and managers can access
 * router.post('/vehicles', authenticate, authorize('ADMIN', 'MANAGER'), vehicleController.create);
 */
function authorize(...allowedRoles) {
  return (req, _res, next) => {
    // authenticate middleware must run before authorize
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!req.user.roleName) {
      throw AppError.forbidden('User role not found');
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      throw AppError.forbidden(
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.roleName}`
      );
    }

    next();
  };
}

module.exports = { authorize };
