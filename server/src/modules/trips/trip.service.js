const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');
const { generateTripNumber } = require('../../utils/tripNumber');

const SORTABLE_FIELDS = ['createdAt', 'tripNumber', 'scheduledDeparture', 'scheduledArrival', 'status', 'distanceKm'];

const TRIP_INCLUDE = {
  vehicle: {
    select: { id: true, registrationNumber: true, make: true, model: true, type: true, capacityKg: true },
  },
  driver: {
    select: { id: true, firstName: true, lastName: true, licenseNumber: true, phone: true },
  },
  dispatchedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  originRegion: {
    select: { id: true, name: true, code: true },
  },
  destinationRegion: {
    select: { id: true, name: true, code: true },
  },
};

class TripService {
  /**
   * List trips with pagination, search, sorting, and filtering.
   */
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS);

    const where = this.buildWhereClause(query);

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
        include: TRIP_INCLUDE,
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single trip by ID with full details.
   */
  async getById(id) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        ...TRIP_INCLUDE,
        expenses: {
          select: { id: true, category: true, amount: true, description: true, expenseDate: true },
          orderBy: { expenseDate: 'desc' },
        },
      },
    });

    if (!trip) {
      throw AppError.notFound('Trip not found');
    }

    return trip;
  }

  /**
   * Create a new trip.
   * Business rules:
   * - Vehicle must exist and be AVAILABLE
   * - Driver must exist and be AVAILABLE with valid license
   * - Origin and destination regions must exist and be different
   * - Cargo weight must not exceed vehicle capacity
   * - Trip number is auto-generated
   */
  async create(data, dispatchedById) {
    // Validate vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw AppError.notFound('Vehicle not found');
    if (vehicle.status === 'RETIRED') throw AppError.badRequest('Cannot assign a retired vehicle to a trip');
    if (vehicle.status === 'IN_SHOP') throw AppError.badRequest('Cannot assign a vehicle that is in maintenance');
    if (vehicle.status === 'ON_TRIP') throw AppError.badRequest('Vehicle is already assigned to another trip');

    // Validate driver
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) throw AppError.notFound('Driver not found');
    if (driver.status === 'SUSPENDED') throw AppError.badRequest('Cannot assign a suspended driver');
    if (driver.status === 'ON_LEAVE') throw AppError.badRequest('Cannot assign a driver who is on leave');
    if (driver.status === 'ON_TRIP') throw AppError.badRequest('Driver is already assigned to another trip');

    // Validate driver license
    if (new Date(driver.licenseExpiry) < new Date()) {
      throw AppError.badRequest('Cannot assign a driver with an expired license');
    }

    // Validate regions
    const originRegion = await prisma.region.findUnique({ where: { id: data.originRegionId } });
    if (!originRegion) throw AppError.notFound('Origin region not found');

    const destRegion = await prisma.region.findUnique({ where: { id: data.destinationRegionId } });
    if (!destRegion) throw AppError.notFound('Destination region not found');

    // Validate cargo weight vs vehicle capacity
    if (data.cargoWeightKg && data.cargoWeightKg > parseFloat(vehicle.capacityKg)) {
      throw AppError.badRequest(
        `Cargo weight (${data.cargoWeightKg} kg) exceeds vehicle capacity (${vehicle.capacityKg} kg)`
      );
    }

    // Generate trip number
    const tripNumber = await generateTripNumber();

    const trip = await prisma.trip.create({
      data: {
        ...data,
        tripNumber,
        dispatchedById,
        status: 'SCHEDULED',
      },
      include: TRIP_INCLUDE,
    });

    return trip;
  }

  /**
   * Update a trip.
   * Only SCHEDULED trips can be fully edited.
   */
  async update(id, data) {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Trip not found');

    if (existing.status !== 'SCHEDULED') {
      throw AppError.badRequest(`Cannot edit a trip with status '${existing.status}'. Only SCHEDULED trips can be modified.`);
    }

    // If vehicle is changing, validate new vehicle
    if (data.vehicleId && data.vehicleId !== existing.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw AppError.notFound('Vehicle not found');
      if (vehicle.status !== 'AVAILABLE') {
        throw AppError.badRequest(`Vehicle is not available (current status: ${vehicle.status})`);
      }
      if (data.cargoWeightKg && data.cargoWeightKg > parseFloat(vehicle.capacityKg)) {
        throw AppError.badRequest(`Cargo weight exceeds vehicle capacity (${vehicle.capacityKg} kg)`);
      }
    }

    // If driver is changing, validate new driver
    if (data.driverId && data.driverId !== existing.driverId) {
      const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
      if (!driver) throw AppError.notFound('Driver not found');
      if (driver.status !== 'AVAILABLE') {
        throw AppError.badRequest(`Driver is not available (current status: ${driver.status})`);
      }
      if (new Date(driver.licenseExpiry) < new Date()) {
        throw AppError.badRequest('Cannot assign a driver with an expired license');
      }
    }

    const trip = await prisma.trip.update({
      where: { id },
      data,
      include: TRIP_INCLUDE,
    });

    return trip;
  }

  /**
   * DISPATCH a trip.
   * SCHEDULED → DISPATCHED
   * Side effects: Vehicle → ON_TRIP, Driver → ON_TRIP
   * Uses a Prisma transaction to ensure atomicity.
   */
  async dispatch(id, data) {
    const existing = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!existing) throw AppError.notFound('Trip not found');
    if (existing.status !== 'SCHEDULED') {
      throw AppError.badRequest(`Cannot dispatch a trip with status '${existing.status}'. Only SCHEDULED trips can be dispatched.`);
    }

    // Re-validate vehicle availability at dispatch time
    if (existing.vehicle.status !== 'AVAILABLE') {
      throw AppError.badRequest(`Vehicle is no longer available (status: ${existing.vehicle.status})`);
    }

    // Re-validate driver availability at dispatch time
    if (existing.driver.status !== 'AVAILABLE') {
      throw AppError.badRequest(`Driver is no longer available (status: ${existing.driver.status})`);
    }

    // Re-validate driver license at dispatch time
    if (new Date(existing.driver.licenseExpiry) < new Date()) {
      throw AppError.badRequest('Driver license has expired since trip was scheduled');
    }

    // Transaction: update trip + vehicle + driver atomically
    const trip = await prisma.$transaction(async (tx) => {
      // Update trip status
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: 'DISPATCHED',
          actualDeparture: data.actualDeparture || new Date(),
        },
        include: TRIP_INCLUDE,
      });

      // Set vehicle to ON_TRIP
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'ON_TRIP' },
      });

      // Set driver to ON_TRIP
      await tx.driver.update({
        where: { id: existing.driverId },
        data: { status: 'ON_TRIP' },
      });

      return updatedTrip;
    });

    return trip;
  }

  /**
   * Start a trip (mark as IN_PROGRESS).
   * DISPATCHED → IN_PROGRESS
   */
  async startTrip(id) {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Trip not found');

    if (existing.status !== 'DISPATCHED') {
      throw AppError.badRequest(`Cannot start a trip with status '${existing.status}'. Only DISPATCHED trips can be started.`);
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actualDeparture: existing.actualDeparture || new Date(),
      },
      include: TRIP_INCLUDE,
    });

    return trip;
  }

  /**
   * COMPLETE a trip.
   * DISPATCHED or IN_PROGRESS → COMPLETED
   * Side effects: Vehicle → AVAILABLE, Driver → AVAILABLE, Vehicle mileage updated
   */
  async complete(id, data) {
    const existing = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!existing) throw AppError.notFound('Trip not found');

    if (!['DISPATCHED', 'IN_PROGRESS'].includes(existing.status)) {
      throw AppError.badRequest(`Cannot complete a trip with status '${existing.status}'. Only DISPATCHED or IN_PROGRESS trips can be completed.`);
    }

    const actualArrival = data.actualArrival || new Date();

    // Validate arrival is after departure
    if (existing.actualDeparture && actualArrival < existing.actualDeparture) {
      throw AppError.badRequest('Actual arrival cannot be before actual departure');
    }

    const updateData = {
      status: 'COMPLETED',
      actualArrival,
    };

    if (data.distanceKm !== undefined && data.distanceKm !== null) {
      updateData.distanceKm = data.distanceKm;
    }

    if (data.notes) {
      updateData.notes = existing.notes
        ? `${existing.notes}\n[Completion Note] ${data.notes}`
        : `[Completion Note] ${data.notes}`;
    }

    // Transaction: update trip + vehicle + driver atomically
    const trip = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: updateData,
        include: TRIP_INCLUDE,
      });

      // Set vehicle back to AVAILABLE and update mileage
      const mileageUpdate = data.distanceKm
        ? { mileage: { increment: data.distanceKm } }
        : {};

      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'AVAILABLE', ...mileageUpdate },
      });

      // Check if driver has any other active trips before setting AVAILABLE
      const otherActiveTrips = await tx.trip.count({
        where: {
          driverId: existing.driverId,
          id: { not: id },
          status: { in: ['DISPATCHED', 'IN_PROGRESS'] },
        },
      });

      if (otherActiveTrips === 0) {
        await tx.driver.update({
          where: { id: existing.driverId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedTrip;
    });

    return trip;
  }

  /**
   * CANCEL a trip.
   * SCHEDULED or DISPATCHED → CANCELLED
   * Side effects: If DISPATCHED, Vehicle → AVAILABLE, Driver → AVAILABLE
   */
  async cancel(id, reason) {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Trip not found');

    if (!['SCHEDULED', 'DISPATCHED'].includes(existing.status)) {
      throw AppError.badRequest(`Cannot cancel a trip with status '${existing.status}'. Only SCHEDULED or DISPATCHED trips can be cancelled.`);
    }

    const noteText = existing.notes
      ? `${existing.notes}\n[Cancelled] ${reason}`
      : `[Cancelled] ${reason}`;

    if (existing.status === 'DISPATCHED') {
      // Transaction: cancel trip + release vehicle + release driver
      const trip = await prisma.$transaction(async (tx) => {
        const updatedTrip = await tx.trip.update({
          where: { id },
          data: { status: 'CANCELLED', notes: noteText },
          include: TRIP_INCLUDE,
        });

        await tx.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: 'AVAILABLE' },
        });

        // Check if driver has other active trips
        const otherActiveTrips = await tx.trip.count({
          where: {
            driverId: existing.driverId,
            id: { not: id },
            status: { in: ['DISPATCHED', 'IN_PROGRESS'] },
          },
        });

        if (otherActiveTrips === 0) {
          await tx.driver.update({
            where: { id: existing.driverId },
            data: { status: 'AVAILABLE' },
          });
        }

        return updatedTrip;
      });

      return trip;
    }

    // SCHEDULED — just cancel (no side effects needed)
    const trip = await prisma.trip.update({
      where: { id },
      data: { status: 'CANCELLED', notes: noteText },
      include: TRIP_INCLUDE,
    });

    return trip;
  }

  /**
   * Delete a trip.
   * Only SCHEDULED or CANCELLED trips can be deleted.
   */
  async delete(id) {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Trip not found');

    if (!['SCHEDULED', 'CANCELLED'].includes(existing.status)) {
      throw AppError.badRequest(`Cannot delete a trip with status '${existing.status}'. Only SCHEDULED or CANCELLED trips can be deleted.`);
    }

    await prisma.trip.delete({ where: { id } });
    return { message: 'Trip deleted successfully' };
  }

  /**
   * Get trip statistics summary (for dashboard).
   */
  async getStats() {
    const [total, scheduled, dispatched, inProgress, completed, cancelled] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { status: 'SCHEDULED' } }),
      prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.trip.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Calculate total distance and average per completed trip
    const distanceAgg = await prisma.trip.aggregate({
      where: { status: 'COMPLETED', distanceKm: { not: null } },
      _sum: { distanceKm: true },
      _avg: { distanceKm: true },
    });

    return {
      total,
      scheduled,
      dispatched,
      inProgress,
      completed,
      cancelled,
      activeTrips: dispatched + inProgress,
      completionRate: total > 0 ? parseFloat(((completed / total) * 100).toFixed(2)) : 0,
      totalDistanceKm: distanceAgg._sum.distanceKm ? parseFloat(distanceAgg._sum.distanceKm) : 0,
      avgDistanceKm: distanceAgg._avg.distanceKm ? parseFloat(parseFloat(distanceAgg._avg.distanceKm).toFixed(2)) : 0,
    };
  }

  /**
   * Build Prisma where clause from query params.
   */
  buildWhereClause(query) {
    const where = {};

    if (query.search) {
      where.OR = [
        { tripNumber: { contains: query.search } },
        { cargoDescription: { contains: query.search } },
        { notes: { contains: query.search } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.vehicleId) where.vehicleId = parseInt(query.vehicleId, 10);
    if (query.driverId) where.driverId = parseInt(query.driverId, 10);
    if (query.originRegionId) where.originRegionId = parseInt(query.originRegionId, 10);
    if (query.destinationRegionId) where.destinationRegionId = parseInt(query.destinationRegionId, 10);

    // Date range filter on scheduledDeparture
    if (query.dateFrom || query.dateTo) {
      where.scheduledDeparture = {};
      if (query.dateFrom) where.scheduledDeparture.gte = new Date(query.dateFrom);
      if (query.dateTo) where.scheduledDeparture.lte = new Date(query.dateTo);
    }

    return where;
  }
}

module.exports = new TripService();
