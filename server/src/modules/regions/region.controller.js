const regionService = require('./region.service');
const ApiResponse = require('../../utils/apiResponse');

class RegionController {
  async list(req, res, next) {
    try {
      const result = await regionService.list(req.query);
      ApiResponse.success(res, {
        message: 'Regions retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const regions = await regionService.getAll();
      ApiResponse.success(res, {
        message: 'All active regions retrieved successfully',
        data: regions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid region ID');
      const region = await regionService.getById(id);
      ApiResponse.success(res, { message: 'Region retrieved successfully', data: region });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const region = await regionService.create(req.body);
      ApiResponse.created(res, { message: 'Region created successfully', data: region });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid region ID');
      const region = await regionService.update(id, req.body);
      ApiResponse.success(res, { message: 'Region updated successfully', data: region });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid region ID');
      const result = await regionService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RegionController();
