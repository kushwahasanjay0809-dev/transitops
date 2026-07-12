const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'startDate', 'endDate', 'cost', 'type', 'status'];

const MAINTENANCE_INCLUDE = {
  vehicle: {
    select: { id: true, registrationNumber: true, make: true, model: true, type: true, status: true },
  },
  reportedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

class MaintenanceService {
  /**
   * List maintenance logs with pagination, search, sorting, and filtering.
   */
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS);

    const where = this.buildWhereClause(query);

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
        include: MAINTENANCE_INCLUDE,
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single maintenance log by ID.
   */
  async getById(id) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: MAINTENANCE_INCLUDE,
    });

    if (!log) throw AppError.notFound('Maintenance log not found');
    return log;
  }

  /**
   * Create a maintenance log.
   * Business rules:
   * - Vehicle must exist
   * - Cannot create maintenance for a RETIRED vehicle
   * - If type is EMERGENCY or CORRECTIVE, optionally set vehicle to IN_SHOP
   */
  async create(data, reportedById) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw AppError.notFound('Vehicle not found');
    if (vehicle.status === 'RETIRED') {
      throw AppError.badRequest('Cannot create maintenance for a retired vehicle');
    }

    // For EMERGENCY maintenance, auto-set vehicle to IN_SHOP if it's AVAILABLE
    const shouldSetInShop =
      (data.type === 'EMERGENCY' || data.type === 'CORRECTIVE') &&
      vehicle.status === 'AVAILABLE';

    if (shouldSetInShop) {
      const log = await prisma.$transaction(async (tx) => {
        const created = await tx.maintenanceLog.create({
          data: { ...data, reportedById },
          include: MAINTENANCE_INCLUDE,
        });

        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { status: 'IN_SHOP' },
        });

        return created;
      });
      return log;
    }

    const log = await prisma.maintenanceLog.create({
      data: { ...data, reportedById },
      include: MAINTENANCE_INCLUDE,
    });

    return log;
  }

  /**
   * Update a maintenance log.
   * Business rules:
   * - When status changes to COMPLETED, set endDate if not provided
   * - When status changes to COMPLETED and no other open/in-progress logs exist,
   *   set vehicle back to AVAILABLE
   */
  async update(id, data) {
    const existing = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!existing) throw AppError.notFound('Maintenance log not found');

    if (['COMPLETED', 'CANCELLED'].includes(existing.status)) {
      if (data.status && data.status !== existing.status) {
        // Allow reopening, but otherwise block edits to completed/cancelled logs
      } else if (!data.status) {
        throw AppError.badRequest(`Cannot edit a ${existing.status.toLowerCase()} maintenance log`);
      }
    }

    // Auto-set endDate when completing
    if (data.status === 'COMPLETED' && !data.endDate) {
      data.endDate = new Date();
    }

    // When completing or cancelling, check if vehicle should be released
    if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
      const otherActive = await prisma.maintenanceLog.count({
        where: {
          vehicleId: existing.vehicleId,
          id: { not: id },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });

      if (otherActive === 0 && existing.vehicle.status === 'IN_SHOP') {
        // Transaction: update log + release vehicle
        const log = await prisma.$transaction(async (tx) => {
          const updated = await tx.maintenanceLog.update({
            where: { id },
            data,
            include: MAINTENANCE_INCLUDE,
          });

          await tx.vehicle.update({
            where: { id: existing.vehicleId },
            data: {
              status: 'AVAILABLE',
              lastServiceDate: data.status === 'COMPLETED' ? new Date() : undefined,
            },
          });

          return updated;
        });
        return log;
      }
    }

    // When setting to IN_PROGRESS, set vehicle to IN_SHOP if AVAILABLE
    if (data.status === 'IN_PROGRESS' && existing.vehicle.status === 'AVAILABLE') {
      const log = await prisma.$transaction(async (tx) => {
        const updated = await tx.maintenanceLog.update({
          where: { id },
          data,
          include: MAINTENANCE_INCLUDE,
        });

        await tx.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: 'IN_SHOP' },
        });

        return updated;
      });
      return log;
    }

    const log = await prisma.maintenanceLog.update({
      where: { id },
      data,
      include: MAINTENANCE_INCLUDE,
    });

    return log;
  }

  /**
   * Delete a maintenance log.
   * Only OPEN or CANCELLED logs can be deleted.
   */
  async delete(id) {
    const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Maintenance log not found');

    if (!['OPEN', 'CANCELLED'].includes(existing.status)) {
      throw AppError.badRequest(
        `Cannot delete a maintenance log with status '${existing.status}'. Only OPEN or CANCELLED logs can be deleted.`
      );
    }

    await prisma.maintenanceLog.delete({ where: { id } });
    return { message: 'Maintenance log deleted successfully' };
  }

  /**
   * Get maintenance statistics (for dashboard).
   */
  async getStats() {
    const [total, open, inProgress, completed, cancelled] = await Promise.all([
      prisma.maintenanceLog.count(),
      prisma.maintenanceLog.count({ where: { status: 'OPEN' } }),
      prisma.maintenanceLog.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.maintenanceLog.count({ where: { status: 'COMPLETED' } }),
      prisma.maintenanceLog.count({ where: { status: 'CANCELLED' } }),
    ]);

    const costAgg = await prisma.maintenanceLog.aggregate({
      where: { status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
      _sum: { cost: true },
      _avg: { cost: true },
    });

    const byType = await prisma.maintenanceLog.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { cost: true },
    });

    return {
      total,
      open,
      inProgress,
      completed,
      cancelled,
      activeCount: open + inProgress,
      totalCost: costAgg._sum.cost ? parseFloat(costAgg._sum.cost) : 0,
      avgCost: costAgg._avg.cost ? parseFloat(parseFloat(costAgg._avg.cost).toFixed(2)) : 0,
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count.id,
        totalCost: t._sum.cost ? parseFloat(t._sum.cost) : 0,
      })),
    };
  }

  buildWhereClause(query) {
    const where = {};

    if (query.search) {
      where.OR = [
        { description: { contains: query.search } },
        { vendorName: { contains: query.search } },
        { notes: { contains: query.search } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.vehicleId) where.vehicleId = parseInt(query.vehicleId, 10);

    if (query.dateFrom || query.dateTo) {
      where.startDate = {};
      if (query.dateFrom) where.startDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.startDate.lte = new Date(query.dateTo);
    }

    return where;
  }
}

module.exports = new MaintenanceService();
