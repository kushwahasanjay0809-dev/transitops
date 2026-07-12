const maintenanceService = require('./maintenance.service');
const ApiResponse = require('../../utils/apiResponse');

class MaintenanceController {
  async list(req, res, next) {
    try {
      const result = await maintenanceService.list(req.query);
      ApiResponse.success(res, {
        message: 'Maintenance logs retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await maintenanceService.getStats();
      ApiResponse.success(res, {
        message: 'Maintenance statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid maintenance log ID');
      const log = await maintenanceService.getById(id);
      ApiResponse.success(res, { message: 'Maintenance log retrieved successfully', data: log });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const log = await maintenanceService.create(req.body, req.user.id);
      ApiResponse.created(res, { message: 'Maintenance log created successfully', data: log });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid maintenance log ID');
      const log = await maintenanceService.update(id, req.body);
      ApiResponse.success(res, { message: 'Maintenance log updated successfully', data: log });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid maintenance log ID');
      const result = await maintenanceService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
