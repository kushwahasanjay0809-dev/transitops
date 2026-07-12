const AppError = require('../utils/appError');

/**
 * Request validation middleware factory.
 * Validates req.body, req.query, or req.params against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/vehicles', validate(createVehicleSchema), vehicleController.create);
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const result = schema.parse(req[source]);
      // Replace the source with the parsed (and potentially transformed) data
      req[source] = result;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw AppError.badRequest('Validation failed', errors);
      }
      throw error;
    }
  };
}

module.exports = validate;
