const tripService = require('./trip.service');
const ApiResponse = require('../../utils/apiResponse');

class TripController {
  /**
   * GET /api/trips
   */
  async list(req, res, next) {
    try {
      const result = await tripService.list(req.query);
      ApiResponse.success(res, {
        message: 'Trips retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/trips/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await tripService.getStats();
      ApiResponse.success(res, {
        message: 'Trip statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/trips/:id
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const trip = await tripService.getById(id);
      ApiResponse.success(res, {
        message: 'Trip retrieved successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/trips
   */
  async create(req, res, next) {
    try {
      const trip = await tripService.create(req.body, req.user.id);
      ApiResponse.created(res, {
        message: 'Trip created successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/trips/:id
   */
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const trip = await tripService.update(id, req.body);
      ApiResponse.success(res, {
        message: 'Trip updated successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/trips/:id/dispatch
   */
  async dispatch(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const trip = await tripService.dispatch(id, req.body);
      ApiResponse.success(res, {
        message: 'Trip dispatched successfully — vehicle and driver set to ON_TRIP',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/trips/:id/start
   */
  async startTrip(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const trip = await tripService.startTrip(id);
      ApiResponse.success(res, {
        message: 'Trip started — now IN_PROGRESS',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/trips/:id/complete
   */
  async complete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const trip = await tripService.complete(id, req.body);
      ApiResponse.success(res, {
        message: 'Trip completed — vehicle and driver released',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/trips/:id/cancel
   */
  async cancel(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const trip = await tripService.cancel(id, req.body.reason);
      ApiResponse.success(res, {
        message: 'Trip cancelled successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/trips/:id
   */
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid trip ID');

      const result = await tripService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TripController();
