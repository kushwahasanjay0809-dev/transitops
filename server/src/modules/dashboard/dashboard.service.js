const { prisma } = require('../../config/database');

class DashboardService {
  /**
   * Get comprehensive dashboard data in a single call.
   * Aggregates stats from all modules for the frontend dashboard.
   */
  async getDashboard() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all queries in parallel for performance
    const [
      vehicleStats,
      driverStats,
      tripStats,
      maintenanceStats,
      recentTrips,
      upcomingTrips,
      expenseStats,
      fuelStats,
      activeMaintenanceLogs,
      expiringLicenses,
      expiringInsurance,
    ] = await Promise.all([
      // Vehicle counts by status
      this.getVehicleStats(),
      // Driver counts by status
      this.getDriverStats(today),
      // Trip counts by status + recent completion metrics
      this.getTripStats(thirtyDaysAgo),
      // Maintenance summary
      this.getMaintenanceStats(),
      // Last 5 completed/active trips
      this.getRecentTrips(),
      // Next 5 scheduled trips
      this.getUpcomingTrips(),
      // Expense totals for current month
      this.getExpenseStats(today),
      // Fuel totals for current month
      this.getFuelStats(today),
      // Active maintenance logs
      this.getActiveMaintenanceLogs(),
      // Drivers with licenses expiring in 30 days
      this.getExpiringLicenses(today, thirtyDaysAgo),
      // Vehicles with insurance expiring in 30 days
      this.getExpiringInsurance(today, thirtyDaysAgo),
    ]);

    return {
      vehicles: vehicleStats,
      drivers: driverStats,
      trips: tripStats,
      maintenance: maintenanceStats,
      expenses: expenseStats,
      fuel: fuelStats,
      recentTrips,
      upcomingTrips,
      activeMaintenanceLogs,
      alerts: {
        expiringLicenses,
        expiringInsurance,
      },
    };
  }

  async getVehicleStats() {
    const [total, available, onTrip, inShop, retired] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
      prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
      prisma.vehicle.count({ where: { status: 'RETIRED' } }),
    ]);

    const activeFleet = total - retired;
    return {
      total, available, onTrip, inShop, retired,
      utilizationRate: activeFleet > 0 ? parseFloat(((onTrip / activeFleet) * 100).toFixed(1)) : 0,
    };
  }

  async getDriverStats(today) {
    const [total, available, onTrip, onLeave, suspended, expiredLicense] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: 'AVAILABLE' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
      prisma.driver.count({ where: { status: 'ON_LEAVE' } }),
      prisma.driver.count({ where: { status: 'SUSPENDED' } }),
      prisma.driver.count({ where: { licenseExpiry: { lt: today } } }),
    ]);

    return { total, available, onTrip, onLeave, suspended, expiredLicense };
  }

  async getTripStats(thirtyDaysAgo) {
    const [total, scheduled, dispatched, inProgress, completed, cancelled] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { status: 'SCHEDULED' } }),
      prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.trip.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Trips completed in the last 30 days
    const recentCompleted = await prisma.trip.count({
      where: {
        status: 'COMPLETED',
        actualArrival: { gte: thirtyDaysAgo },
      },
    });

    // Total distance in last 30 days
    const distanceAgg = await prisma.trip.aggregate({
      where: {
        status: 'COMPLETED',
        actualArrival: { gte: thirtyDaysAgo },
        distanceKm: { not: null },
      },
      _sum: { distanceKm: true },
    });

    return {
      total, scheduled, dispatched, inProgress, completed, cancelled,
      activeTrips: dispatched + inProgress,
      recentCompleted,
      recentDistanceKm: distanceAgg._sum.distanceKm ? parseFloat(distanceAgg._sum.distanceKm) : 0,
    };
  }

  async getMaintenanceStats() {
    const [open, inProgress, totalCost] = await Promise.all([
      prisma.maintenanceLog.count({ where: { status: 'OPEN' } }),
      prisma.maintenanceLog.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.maintenanceLog.aggregate({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        _sum: { cost: true },
      }),
    ]);

    return {
      activeCount: open + inProgress,
      open,
      inProgress,
      activeCost: totalCost._sum.cost ? parseFloat(totalCost._sum.cost) : 0,
    };
  }

  async getExpenseStats(today) {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [monthlyTotal, allTimeTotal] = await Promise.all([
      prisma.expense.aggregate({
        where: { expenseDate: { gte: monthStart } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      currentMonthTotal: monthlyTotal._sum.amount ? parseFloat(monthlyTotal._sum.amount) : 0,
      currentMonthCount: monthlyTotal._count.id,
      allTimeTotal: allTimeTotal._sum.amount ? parseFloat(allTimeTotal._sum.amount) : 0,
    };
  }

  async getFuelStats(today) {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [monthlyTotal, allTimeTotal] = await Promise.all([
      prisma.fuelLog.aggregate({
        where: { fuelDate: { gte: monthStart } },
        _sum: { totalCost: true, quantity: true },
        _count: { id: true },
      }),
      prisma.fuelLog.aggregate({
        _sum: { totalCost: true, quantity: true },
      }),
    ]);

    return {
      currentMonthCost: monthlyTotal._sum.totalCost ? parseFloat(monthlyTotal._sum.totalCost) : 0,
      currentMonthQuantity: monthlyTotal._sum.quantity ? parseFloat(monthlyTotal._sum.quantity) : 0,
      currentMonthCount: monthlyTotal._count.id,
      allTimeCost: allTimeTotal._sum.totalCost ? parseFloat(allTimeTotal._sum.totalCost) : 0,
      allTimeQuantity: allTimeTotal._sum.quantity ? parseFloat(allTimeTotal._sum.quantity) : 0,
    };
  }

  async getRecentTrips() {
    return prisma.trip.findMany({
      where: { status: { in: ['DISPATCHED', 'IN_PROGRESS', 'COMPLETED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        vehicle: { select: { registrationNumber: true, make: true, model: true } },
        driver: { select: { firstName: true, lastName: true } },
        originRegion: { select: { name: true, code: true } },
        destinationRegion: { select: { name: true, code: true } },
      },
    });
  }

  async getUpcomingTrips() {
    return prisma.trip.findMany({
      where: { status: 'SCHEDULED', scheduledDeparture: { gte: new Date() } },
      orderBy: { scheduledDeparture: 'asc' },
      take: 5,
      include: {
        vehicle: { select: { registrationNumber: true, make: true, model: true } },
        driver: { select: { firstName: true, lastName: true } },
        originRegion: { select: { name: true, code: true } },
        destinationRegion: { select: { name: true, code: true } },
      },
    });
  }

  async getActiveMaintenanceLogs() {
    return prisma.maintenanceLog.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: { startDate: 'desc' },
      take: 5,
      include: {
        vehicle: { select: { registrationNumber: true, make: true, model: true } },
        reportedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getExpiringLicenses(today) {
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return prisma.driver.findMany({
      where: {
        licenseExpiry: { gte: today, lte: thirtyDaysFromNow },
        status: { not: 'SUSPENDED' },
      },
      select: {
        id: true, firstName: true, lastName: true,
        licenseNumber: true, licenseExpiry: true, status: true,
      },
      orderBy: { licenseExpiry: 'asc' },
    });
  }

  async getExpiringInsurance(today) {
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return prisma.vehicle.findMany({
      where: {
        insuranceExpiry: { gte: today, lte: thirtyDaysFromNow },
        status: { not: 'RETIRED' },
      },
      select: {
        id: true, registrationNumber: true, make: true, model: true,
        insuranceExpiry: true, status: true,
      },
      orderBy: { insuranceExpiry: 'asc' },
    });
  }
}

module.exports = new DashboardService();
