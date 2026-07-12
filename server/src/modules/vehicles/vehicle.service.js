const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'registrationNumber', 'make', 'model', 'year', 'mileage', 'capacityKg'];

class VehicleService {
  /**
   * List vehicles with pagination, search, sorting, and filtering.
   */
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS);

    const where = this.buildWhereClause(query);

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single vehicle by ID with related statistics.
   */
  async getById(id) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            trips: true,
            maintenanceLogs: true,
            fuelLogs: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw AppError.notFound('Vehicle not found');
    }

    return vehicle;
  }

  /**
   * Create a new vehicle.
   * Business rule: Registration number must be unique.
   */
  async create(data) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });

    if (existing) {
      throw AppError.conflict(`Vehicle with registration number ${data.registrationNumber} already exists`);
    }

    const vehicle = await prisma.vehicle.create({ data });
    return vehicle;
  }

  /**
   * Update an existing vehicle.
   * Business rules:
   * - Registration number must remain unique.
   * - Cannot change status to AVAILABLE if vehicle has active maintenance.
   */
  async update(id, data) {
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Vehicle not found');
    }

    // If registration number is changing, check uniqueness
    if (data.registrationNumber && data.registrationNumber !== existing.registrationNumber) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { registrationNumber: data.registrationNumber },
      });
      if (duplicate) {
        throw AppError.conflict(`Vehicle with registration number ${data.registrationNumber} already exists`);
      }
    }

    // Business rule: Cannot set to AVAILABLE if active maintenance exists
    if (data.status === 'AVAILABLE' && existing.status === 'IN_SHOP') {
      const activeMaintenance = await prisma.maintenanceLog.count({
        where: {
          vehicleId: id,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });

      if (activeMaintenance > 0) {
        throw AppError.badRequest(
          'Cannot set vehicle to AVAILABLE while it has active maintenance records. Complete or cancel maintenance first.'
        );
      }
    }

    // Business rule: Cannot retire a vehicle that is ON_TRIP
    if (data.status === 'RETIRED' && existing.status === 'ON_TRIP') {
      throw AppError.badRequest('Cannot retire a vehicle that is currently on a trip');
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return vehicle;
  }

  /**
   * Delete a vehicle.
   * Business rule: Cannot delete if vehicle has active trips.
   */
  async delete(id) {
    const existing = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          where: {
            status: { in: ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS'] },
          },
          select: { id: true, tripNumber: true, status: true },
        },
      },
    });

    if (!existing) {
      throw AppError.notFound('Vehicle not found');
    }

    if (existing.trips.length > 0) {
      throw AppError.badRequest(
        `Cannot delete vehicle with ${existing.trips.length} active trip(s). Cancel or complete trips first.`
      );
    }

    await prisma.vehicle.delete({ where: { id } });
    return { message: 'Vehicle deleted successfully' };
  }

  /**
   * Get available vehicles (for trip assignment dropdowns).
   * Excludes RETIRED, IN_SHOP, and ON_TRIP vehicles.
   */
  async getAvailable() {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { registrationNumber: 'asc' },
      select: {
        id: true,
        registrationNumber: true,
        make: true,
        model: true,
        type: true,
        capacityKg: true,
        fuelType: true,
      },
    });

    return vehicles;
  }

  /**
   * Get vehicle statistics summary (for dashboard).
   */
  async getStats() {
    const [total, available, onTrip, inShop, retired] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
      prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
      prisma.vehicle.count({ where: { status: 'RETIRED' } }),
    ]);

    return {
      total,
      available,
      onTrip,
      inShop,
      retired,
      utilizationRate: total - retired > 0
        ? parseFloat(((onTrip / (total - retired)) * 100).toFixed(2))
        : 0,
    };
  }

  /**
   * Build Prisma where clause from query params.
   */
  buildWhereClause(query) {
    const where = {};

    if (query.search) {
      where.OR = [
        { registrationNumber: { contains: query.search } },
        { make: { contains: query.search } },
        { model: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.fuelType) {
      where.fuelType = query.fuelType;
    }

    return where;
  }
}

module.exports = new VehicleService();
