const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

/**
 * General API rate limiter.
 * Limits each IP to a configurable number of requests per window.
 */
const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs, // Default: 15 minutes
  max: env.rateLimitMaxRequests,   // Default: 100 requests per window
  standardHeaders: true,           // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,            // Disable X-RateLimit-* headers
  handler: (req, res) => {
    ApiResponse.error(res, {
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    });
  },
});

/**
 * Stricter rate limiter for authentication endpoints.
 * Limits each IP to 10 attempts per 15-minute window.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(res, {
      statusCode: 429,
      message: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

module.exports = { apiLimiter, authLimiter };
