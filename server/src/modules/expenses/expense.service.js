const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'expenseDate', 'amount', 'category'];

const EXPENSE_INCLUDE = {
  vehicle: {
    select: { id: true, registrationNumber: true, make: true, model: true },
  },
  trip: {
    select: { id: true, tripNumber: true, status: true },
  },
  recordedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

class ExpenseService {
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS, 'expenseDate');

    const where = this.buildWhereClause(query);

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where, skip, take,
        orderBy: { [field]: order },
        include: EXPENSE_INCLUDE,
      }),
      prisma.expense.count({ where }),
    ]);

    return { data: expenses, meta: buildPaginationMeta(total, page, limit) };
  }

  async getById(id) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: EXPENSE_INCLUDE,
    });
    if (!expense) throw AppError.notFound('Expense not found');
    return expense;
  }

  async create(data, recordedById) {
    // Validate vehicle if provided
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw AppError.notFound('Vehicle not found');
    }

    // Validate trip if provided
    if (data.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
      if (!trip) throw AppError.notFound('Trip not found');
    }

    const expense = await prisma.expense.create({
      data: { ...data, recordedById },
      include: EXPENSE_INCLUDE,
    });

    return expense;
  }

  async update(id, data) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Expense not found');

    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw AppError.notFound('Vehicle not found');
    }

    if (data.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
      if (!trip) throw AppError.notFound('Trip not found');
    }

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: EXPENSE_INCLUDE,
    });

    return expense;
  }

  async delete(id) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Expense not found');

    await prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
  }

  async getStats() {
    const totalAgg = await prisma.expense.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true },
    });

    const byCategory = await prisma.expense.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Monthly expense trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentExpenses = await prisma.expense.findMany({
      where: { expenseDate: { gte: sixMonthsAgo } },
      select: { expenseDate: true, amount: true, category: true },
      orderBy: { expenseDate: 'asc' },
    });

    const monthlyMap = {};
    recentExpenses.forEach((exp) => {
      const key = `${exp.expenseDate.getFullYear()}-${String(exp.expenseDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = 0;
      monthlyMap[key] += parseFloat(exp.amount);
    });

    const monthlyTrend = Object.entries(monthlyMap).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));

    // Top 5 vehicles by expense
    const topVehicles = await prisma.expense.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { not: null } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Enrich with vehicle details
    const enrichedTopVehicles = await Promise.all(
      topVehicles.map(async (v) => {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: v.vehicleId },
          select: { registrationNumber: true, make: true, model: true },
        });
        return {
          vehicleId: v.vehicleId,
          registrationNumber: vehicle?.registrationNumber || 'Unknown',
          vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown',
          totalExpense: v._sum.amount ? parseFloat(v._sum.amount) : 0,
          count: v._count.id,
        };
      })
    );

    return {
      totalExpenses: totalAgg._count.id,
      totalAmount: totalAgg._sum.amount ? parseFloat(totalAgg._sum.amount) : 0,
      avgAmount: totalAgg._avg.amount ? parseFloat(parseFloat(totalAgg._avg.amount).toFixed(2)) : 0,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count.id,
        totalAmount: c._sum.amount ? parseFloat(c._sum.amount) : 0,
        avgAmount: c._avg.amount ? parseFloat(parseFloat(c._avg.amount).toFixed(2)) : 0,
      })),
      monthlyTrend,
      topVehicles: enrichedTopVehicles,
    };
  }

  buildWhereClause(query) {
    const where = {};
    if (query.search) {
      where.OR = [
        { description: { contains: query.search } },
        { notes: { contains: query.search } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.vehicleId) where.vehicleId = parseInt(query.vehicleId, 10);
    if (query.tripId) where.tripId = parseInt(query.tripId, 10);
    if (query.dateFrom || query.dateTo) {
      where.expenseDate = {};
      if (query.dateFrom) where.expenseDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.expenseDate.lte = new Date(query.dateTo);
    }
    return where;
  }
}

module.exports = new ExpenseService();
