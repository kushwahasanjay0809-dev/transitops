/**
 * Standardized API response helpers.
 * Every controller uses these to ensure consistent response format.
 */

class ApiResponse {
  /**
   * Success response
   * @param {import('express').Response} res
   * @param {object} options
   * @param {number} options.statusCode - HTTP status (default 200)
   * @param {string} options.message - Success message
   * @param {any} options.data - Response data
   * @param {object} options.meta - Pagination metadata
   */
  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    if (meta !== null) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (HTTP 201)
   */
  static created(res, { message = 'Created successfully', data = null } = {}) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  /**
   * Error response
   * @param {import('express').Response} res
   * @param {object} options
   * @param {number} options.statusCode - HTTP status (default 500)
   * @param {string} options.message - Error message
   * @param {Array} options.errors - Validation errors array
   */
  static error(res, { statusCode = 500, message = 'Internal server error', errors = null } = {}) {
    const response = {
      success: false,
      message,
    };

    if (errors !== null) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Not Found response (HTTP 404)
   */
  static notFound(res, message = 'Resource not found') {
    return ApiResponse.error(res, { statusCode: 404, message });
  }

  /**
   * Unauthorized response (HTTP 401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return ApiResponse.error(res, { statusCode: 401, message });
  }

  /**
   * Forbidden response (HTTP 403)
   */
  static forbidden(res, message = 'Forbidden — insufficient permissions') {
    return ApiResponse.error(res, { statusCode: 403, message });
  }

  /**
   * Bad Request response (HTTP 400)
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return ApiResponse.error(res, { statusCode: 400, message, errors });
  }

  /**
   * Conflict response (HTTP 409)
   */
  static conflict(res, message = 'Resource already exists') {
    return ApiResponse.error(res, { statusCode: 409, message });
  }
}

module.exports = ApiResponse;
