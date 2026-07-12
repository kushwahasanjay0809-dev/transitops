const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handling middleware.
 * Catches all errors thrown in routes/middleware and returns a consistent response.
 * Must be registered LAST in the middleware chain (4-argument signature).
 */
function errorHandler(err, req, res, _next) {
  // Log error in development
  if (env.isDevelopment) {
    console.error('❌ Error:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    // In production, log only critical info
    console.error('❌ Error:', err.message);
  }

  // Prisma known request error (e.g., unique constraint violation)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return ApiResponse.conflict(res, `A record with this ${field} already exists`);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return ApiResponse.notFound(res, err.meta?.cause || 'Record not found');
  }

  // Prisma foreign key constraint failure
  if (err.code === 'P2003') {
    const field = err.meta?.field_name || 'reference';
    return ApiResponse.badRequest(res, `Invalid reference: ${field} does not exist`);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return ApiResponse.badRequest(res, 'Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    return ApiResponse.error(res, { statusCode: 403, message: err.message });
  }

  // Express body-parser JSON syntax error
  if (err.type === 'entity.parse.failed') {
    return ApiResponse.badRequest(res, 'Invalid JSON in request body');
  }

  // Custom AppError (operational errors)
  if (err.isOperational) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Unknown / programming errors — don't leak details in production
  return ApiResponse.error(res, {
    statusCode: 500,
    message: env.isProduction ? 'Something went wrong' : err.message,
  });
}

module.exports = errorHandler;
