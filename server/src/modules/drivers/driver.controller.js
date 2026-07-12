const driverService = require('./driver.service');
const ApiResponse = require('../../utils/apiResponse');

class DriverController {
  /**
   * GET /api/drivers
   */
  async list(req, res, next) {
    try {
      const result = await driverService.list(req.query);
      ApiResponse.success(res, {
        message: 'Drivers retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/drivers/available
   */
  async getAvailable(req, res, next) {
    try {
      const drivers = await driverService.getAvailable();
      ApiResponse.success(res, {
        message: 'Available drivers retrieved successfully',
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/drivers/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await driverService.getStats();
      ApiResponse.success(res, {
        message: 'Driver statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/drivers/:id
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid driver ID');

      const driver = await driverService.getById(id);
      ApiResponse.success(res, {
        message: 'Driver retrieved successfully',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/drivers
   */
  async create(req, res, next) {
    try {
      const driver = await driverService.create(req.body);
      ApiResponse.created(res, {
        message: 'Driver created successfully',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/drivers/:id
   */
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid driver ID');

      const driver = await driverService.update(id, req.body);
      ApiResponse.success(res, {
        message: 'Driver updated successfully',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/drivers/:id
   */
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid driver ID');

      const result = await driverService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();
