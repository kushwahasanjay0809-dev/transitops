const vehicleService = require('./vehicle.service');
const ApiResponse = require('../../utils/apiResponse');

class VehicleController {
  /**
   * GET /api/vehicles
   */
  async list(req, res, next) {
    try {
      const result = await vehicleService.list(req.query);
      ApiResponse.success(res, {
        message: 'Vehicles retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/vehicles/available
   */
  async getAvailable(req, res, next) {
    try {
      const vehicles = await vehicleService.getAvailable();
      ApiResponse.success(res, {
        message: 'Available vehicles retrieved successfully',
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/vehicles/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await vehicleService.getStats();
      ApiResponse.success(res, {
        message: 'Vehicle statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/vehicles/:id
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid vehicle ID');

      const vehicle = await vehicleService.getById(id);
      ApiResponse.success(res, {
        message: 'Vehicle retrieved successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/vehicles
   */
  async create(req, res, next) {
    try {
      const vehicle = await vehicleService.create(req.body);
      ApiResponse.created(res, {
        message: 'Vehicle created successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/vehicles/:id
   */
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid vehicle ID');

      const vehicle = await vehicleService.update(id, req.body);
      ApiResponse.success(res, {
        message: 'Vehicle updated successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/vehicles/:id
   */
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid vehicle ID');

      const result = await vehicleService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();
