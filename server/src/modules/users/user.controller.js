const userService = require('./user.service');
const ApiResponse = require('../../utils/apiResponse');

class UserController {
  /**
   * GET /api/users
   * List all users with pagination, search, and filtering.
   */
  async list(req, res, next) {
    try {
      const result = await userService.list(req.query);

      ApiResponse.success(res, {
        message: 'Users retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/roles
   * Get all available roles.
   */
  async getRoles(req, res, next) {
    try {
      const roles = await userService.getRoles();

      ApiResponse.success(res, {
        message: 'Roles retrieved successfully',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get a single user by ID.
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return ApiResponse.badRequest(res, 'Invalid user ID');
      }

      const user = await userService.getById(id);

      ApiResponse.success(res, {
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Create a new user.
   */
  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);

      ApiResponse.created(res, {
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Update an existing user.
   */
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return ApiResponse.badRequest(res, 'Invalid user ID');
      }

      const user = await userService.update(id, req.body);

      ApiResponse.success(res, {
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete a user.
   */
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return ApiResponse.badRequest(res, 'Invalid user ID');
      }

      const result = await userService.delete(id);

      ApiResponse.success(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
