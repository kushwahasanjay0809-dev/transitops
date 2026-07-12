const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      ApiResponse.success(res, {
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/register
   * Register a new user.
   */
  async register(req, res, next) {
    try {
      const { fullName, email, password } = req.body;
      const user = await authService.register(fullName, email, password);

      ApiResponse.created(res, {
        message: 'Account created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   * Get the current authenticated user's profile.
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);

      ApiResponse.success(res, {
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/change-password
   * Change the current user's password.
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

      ApiResponse.success(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
