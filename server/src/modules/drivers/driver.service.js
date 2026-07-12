const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'firstName', 'lastName', 'licenseNumber', 'licenseExpiry', 'hireDate'];

class DriverService {
  /**
   * List drivers with pagination, search, sorting, and filtering.
   */
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS);

    const where = this.buildWhereClause(query);

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
      }),
      prisma.driver.count({ where }),
    ]);

    // Add computed fields
    const driversWithFlags = drivers.map((driver) => ({
      ...driver,
      isLicenseExpired: new Date(driver.licenseExpiry) < new Date(),
    }));

    return {
      data: driversWithFlags,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single driver by ID with related statistics.
   */
  async getById(id) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            trips: true,
            fuelLogs: true,
          },
        },
      },
    });

    if (!driver) {
      throw AppError.notFound('Driver not found');
    }

    return {
      ...driver,
      isLicenseExpired: new Date(driver.licenseExpiry) < new Date(),
    };
  }

  /**
   * Create a new driver.
   * Business rules:
   * - License number must be unique
   * - Email must be unique
   */
  async create(data) {
    // Check license number uniqueness
    const existingLicense = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });
    if (existingLicense) {
      throw AppError.conflict(`Driver with license number ${data.licenseNumber} already exists`);
    }

    // Check email uniqueness
    const existingEmail = await prisma.driver.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw AppError.conflict(`Driver with email ${data.email} already exists`);
    }

    // Validate date of birth (must be at least 18 years old)
    const today = new Date();
    const dob = new Date(data.dateOfBirth);
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) {
      throw AppError.badRequest('Driver must be at least 18 years old');
    }

    const driver = await prisma.driver.create({ data });
    return {
      ...driver,
      isLicenseExpired: new Date(driver.licenseExpiry) < new Date(),
    };
  }

  /**
   * Update an existing driver.
   */
  async update(id, data) {
    const existing = await prisma.driver.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Driver not found');
    }

    // If license number is changing, check uniqueness
    if (data.licenseNumber && data.licenseNumber !== existing.licenseNumber) {
      const duplicate = await prisma.driver.findUnique({
        where: { licenseNumber: data.licenseNumber },
      });
      if (duplicate) {
        throw AppError.conflict(`Driver with license number ${data.licenseNumber} already exists`);
      }
    }

    // If email is changing, check uniqueness
    if (data.email && data.email !== existing.email) {
      const duplicate = await prisma.driver.findUnique({
        where: { email: data.email },
      });
      if (duplicate) {
        throw AppError.conflict(`Driver with email ${data.email} already exists`);
      }
    }

    // Business rule: Cannot set to AVAILABLE if on a trip
    if (data.status === 'AVAILABLE' && existing.status === 'ON_TRIP') {
      const activeTrips = await prisma.trip.count({
        where: {
          driverId: id,
          status: { in: ['DISPATCHED', 'IN_PROGRESS'] },
        },
      });

      if (activeTrips > 0) {
        throw AppError.badRequest(
          'Cannot set driver to AVAILABLE while they have active trips. Complete or cancel trips first.'
        );
      }
    }

    const driver = await prisma.driver.update({
      where: { id },
      data,
    });

    return {
      ...driver,
      isLicenseExpired: new Date(driver.licenseExpiry) < new Date(),
    };
  }

  /**
   * Delete a driver.
   * Business rule: Cannot delete if driver has active trips.
   */
  async delete(id) {
    const existing = await prisma.driver.findUnique({
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
      throw AppError.notFound('Driver not found');
    }

    if (existing.trips.length > 0) {
      throw AppError.badRequest(
        `Cannot delete driver with ${existing.trips.length} active trip(s). Cancel or complete trips first.`
      );
    }

    await prisma.driver.delete({ where: { id } });
    return { message: 'Driver deleted successfully' };
  }

  /**
   * Get available drivers (for trip assignment dropdowns).
   * Excludes ON_TRIP, ON_LEAVE, SUSPENDED, and license-expired drivers.
   */
  async getAvailable() {
    const today = new Date();

    const drivers = await prisma.driver.findMany({
      where: {
        status: 'AVAILABLE',
        licenseExpiry: { gte: today },
      },
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        licenseNumber: true,
        licenseType: true,
        licenseExpiry: true,
        phone: true,
      },
    });

    return drivers;
  }

  /**
   * Get driver statistics summary (for dashboard).
   */
  async getStats() {
    const today = new Date();

    const [total, available, onTrip, onLeave, suspended, expiredLicense] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: 'AVAILABLE' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
      prisma.driver.count({ where: { status: 'ON_LEAVE' } }),
      prisma.driver.count({ where: { status: 'SUSPENDED' } }),
      prisma.driver.count({ where: { licenseExpiry: { lt: today } } }),
    ]);

    return {
      total,
      available,
      onTrip,
      onLeave,
      suspended,
      expiredLicense,
      assignableCount: available - expiredLicense,
    };
  }

  /**
   * Build Prisma where clause from query params.
   */
  buildWhereClause(query) {
    const where = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
        { licenseNumber: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.licenseType) {
      where.licenseType = query.licenseType;
    }

    if (query.licenseExpired !== undefined) {
      const today = new Date();
      if (query.licenseExpired === true || query.licenseExpired === 'true') {
        where.licenseExpiry = { lt: today };
      } else {
        where.licenseExpiry = { gte: today };
      }
    }

    return where;
  }
}

module.exports = new DriverService();
