const expenseService = require('./expense.service');
const ApiResponse = require('../../utils/apiResponse');

class ExpenseController {
  async list(req, res, next) {
    try {
      const result = await expenseService.list(req.query);
      ApiResponse.success(res, { message: 'Expenses retrieved successfully', data: result.data, meta: result.meta });
    } catch (error) { next(error); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await expenseService.getStats();
      ApiResponse.success(res, { message: 'Expense statistics retrieved successfully', data: stats });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid expense ID');
      const expense = await expenseService.getById(id);
      ApiResponse.success(res, { message: 'Expense retrieved successfully', data: expense });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const expense = await expenseService.create(req.body, req.user.id);
      ApiResponse.created(res, { message: 'Expense created successfully', data: expense });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid expense ID');
      const expense = await expenseService.update(id, req.body);
      ApiResponse.success(res, { message: 'Expense updated successfully', data: expense });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return ApiResponse.badRequest(res, 'Invalid expense ID');
      const result = await expenseService.delete(id);
      ApiResponse.success(res, { message: result.message });
    } catch (error) { next(error); }
  }
}

module.exports = new ExpenseController();
