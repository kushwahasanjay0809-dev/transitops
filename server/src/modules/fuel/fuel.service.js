const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'fuelDate', 'totalCost', 'quantity', 'odometerReading'];

const FUEL_INCLUDE = {
  vehicle: {
    select: { id: true, registrationNumber: true, make: true, model: true, fuelType: true },
  },
  driver: {
    select: { id: true, firstName: true, lastName: true, licenseNumber: true },
  },
  recordedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

class FuelService {
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS, 'fuelDate');

    const where = this.buildWhereClause(query);

    const [logs, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where, skip, take,
        orderBy: { [field]: order },
        include: FUEL_INCLUDE,
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return { data: logs, meta: buildPaginationMeta(total, page, limit) };
  }

  async getById(id) {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: FUEL_INCLUDE,
    });
    if (!log) throw AppError.notFound('Fuel log not found');
    return log;
  }

  async create(data, recordedById) {
    // Validate vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw AppError.notFound('Vehicle not found');
    if (vehicle.status === 'RETIRED') throw AppError.badRequest('Cannot record fuel for a retired vehicle');

    // Validate driver exists
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) throw AppError.notFound('Driver not found');

    // Validate odometer reading is greater than current mileage
    if (data.odometerReading < parseFloat(vehicle.mileage)) {
      throw AppError.badRequest(
        `Odometer reading (${data.odometerReading}) cannot be less than current vehicle mileage (${vehicle.mileage})`
      );
    }

    // Validate totalCost ≈ quantity * pricePerUnit (allow 1% tolerance)
    const expectedCost = data.quantity * data.pricePerUnit;
    const tolerance = expectedCost * 0.01;
    if (Math.abs(data.totalCost - expectedCost) > tolerance) {
      throw AppError.badRequest(
        `Total cost (${data.totalCost}) does not match quantity × price (${expectedCost.toFixed(2)}). Please verify.`
      );
    }

    // Create fuel log and update vehicle mileage in transaction
    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.fuelLog.create({
        data: { ...data, recordedById },
        include: FUEL_INCLUDE,
      });

      // Update vehicle mileage if odometer is higher
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { mileage: data.odometerReading },
      });

      return created;
    });

    return log;
  }

  async update(id, data) {
    const existing = await prisma.fuelLog.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Fuel log not found');

    if (data.vehicleId && data.vehicleId !== existing.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw AppError.notFound('Vehicle not found');
    }

    if (data.driverId && data.driverId !== existing.driverId) {
      const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
      if (!driver) throw AppError.notFound('Driver not found');
    }

    const log = await prisma.fuelLog.update({
      where: { id },
      data,
      include: FUEL_INCLUDE,
    });

    return log;
  }

  async delete(id) {
    const existing = await prisma.fuelLog.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Fuel log not found');

    await prisma.fuelLog.delete({ where: { id } });
    return { message: 'Fuel log deleted successfully' };
  }

  async getStats() {
    const totalAgg = await prisma.fuelLog.aggregate({
      _count: { id: true },
      _sum: { totalCost: true, quantity: true },
      _avg: { pricePerUnit: true, totalCost: true },
    });

    const byFuelType = await prisma.fuelLog.groupBy({
      by: ['fuelType'],
      _count: { id: true },
      _sum: { totalCost: true, quantity: true },
      _avg: { pricePerUnit: true },
    });

    // Monthly fuel costs (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentLogs = await prisma.fuelLog.findMany({
      where: { fuelDate: { gte: sixMonthsAgo } },
      select: { fuelDate: true, totalCost: true },
      orderBy: { fuelDate: 'asc' },
    });

    // Group by month
    const monthlyMap = {};
    recentLogs.forEach((log) => {
      const key = `${log.fuelDate.getFullYear()}-${String(log.fuelDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = 0;
      monthlyMap[key] += parseFloat(log.totalCost);
    });

    const monthlyCosts = Object.entries(monthlyMap).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));

    return {
      totalLogs: totalAgg._count.id,
      totalCost: totalAgg._sum.totalCost ? parseFloat(totalAgg._sum.totalCost) : 0,
      totalQuantity: totalAgg._sum.quantity ? parseFloat(totalAgg._sum.quantity) : 0,
      avgPricePerUnit: totalAgg._avg.pricePerUnit ? parseFloat(parseFloat(totalAgg._avg.pricePerUnit).toFixed(2)) : 0,
      avgCostPerLog: totalAgg._avg.totalCost ? parseFloat(parseFloat(totalAgg._avg.totalCost).toFixed(2)) : 0,
      byFuelType: byFuelType.map((t) => ({
        fuelType: t.fuelType,
        count: t._count.id,
        totalCost: t._sum.totalCost ? parseFloat(t._sum.totalCost) : 0,
        totalQuantity: t._sum.quantity ? parseFloat(t._sum.quantity) : 0,
        avgPrice: t._avg.pricePerUnit ? parseFloat(parseFloat(t._avg.pricePerUnit).toFixed(2)) : 0,
      })),
      monthlyCosts,
    };
  }

  buildWhereClause(query) {
    const where = {};
    if (query.search) {
      where.OR = [
        { station: { contains: query.search } },
        { notes: { contains: query.search } },
      ];
    }
    if (query.vehicleId) where.vehicleId = parseInt(query.vehicleId, 10);
    if (query.driverId) where.driverId = parseInt(query.driverId, 10);
    if (query.fuelType) where.fuelType = query.fuelType;
    if (query.dateFrom || query.dateTo) {
      where.fuelDate = {};
      if (query.dateFrom) where.fuelDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.fuelDate.lte = new Date(query.dateTo);
    }
    return where;
  }
}

module.exports = new FuelService();
