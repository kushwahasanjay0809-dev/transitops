const fuelService = require('./fuel.service');
const ApiResponse = require('../../utils/apiResponse');

class FuelController {
  async list(req, res, next) {
    try {
      const result = await fuelService.list(req.query);
      ApiResponse.success(res, { message: 'Fuel logs retrieved successfully', data: result.data, meta: result.meta });
    } catch (error) { next(error); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await fuelService.getStats();
      ApiResponse.success(res, { message: 'Fuel statistics retrieved successfully', data: stats });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid fuel log ID');
      const log = await fuelService.getById(id);
      ApiResponse.success(res, { message: 'Fuel log retrieved successfully', data: log });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const log = await fuelService.create(req.body, req.user.id);
      ApiResponse.created(res, { message: 'Fuel log created successfully', data: log });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid fuel log ID');
      const log = await fuelService.update(id, req.body);
      ApiResponse.success(res, { message: 'Fuel log updated successfully', data: log });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid fuel log ID');
      const result = await fuelService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) { next(error); }
  }
}

module.exports = new FuelController();
