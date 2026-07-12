const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../utils/apiResponse');

class DashboardController {
  /**
   * GET /api/dashboard
   * Returns comprehensive dashboard data in a single API call.
   */
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboard();
      ApiResponse.success(res, {
        message: 'Dashboard data retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
