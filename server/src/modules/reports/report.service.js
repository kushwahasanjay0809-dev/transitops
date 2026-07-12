const { prisma } = require('../../config/database');

class ReportService {
  /**
   * Trip Report: All trips within a date range with full details.
   */
  async tripReport(dateFrom, dateTo) {
    const trips = await prisma.trip.findMany({
      where: {
        scheduledDeparture: { gte: dateFrom, lte: dateTo },
      },
      include: {
        vehicle: { select: { registrationNumber: true, make: true, model: true, type: true } },
        driver: { select: { firstName: true, lastName: true, licenseNumber: true } },
        originRegion: { select: { name: true, code: true } },
        destinationRegion: { select: { name: true, code: true } },
        dispatchedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledDeparture: 'asc' },
    });

    // Summary
    const summary = {
      totalTrips: trips.length,
      completed: trips.filter((t) => t.status === 'COMPLETED').length,
      cancelled: trips.filter((t) => t.status === 'CANCELLED').length,
      totalDistanceKm: trips.reduce((sum, t) => sum + (t.distanceKm ? parseFloat(t.distanceKm) : 0), 0),
      totalCargoKg: trips.reduce((sum, t) => sum + (t.cargoWeightKg ? parseFloat(t.cargoWeightKg) : 0), 0),
    };

    return { summary, trips };
  }

  /**
   * Flatten trip data for CSV export.
   */
  flattenTripsForCSV(trips) {
    return trips.map((t) => ({
      tripNumber: t.tripNumber,
      status: t.status,
      vehicle: t.vehicle.registrationNumber,
      vehicleType: t.vehicle.type,
      driver: `${t.driver.firstName} ${t.driver.lastName}`,
      origin: t.originRegion.name,
      destination: t.destinationRegion.name,
      cargoDescription: t.cargoDescription || '',
      cargoWeightKg: t.cargoWeightKg ? parseFloat(t.cargoWeightKg) : '',
      distanceKm: t.distanceKm ? parseFloat(t.distanceKm) : '',
      scheduledDeparture: t.scheduledDeparture.toISOString(),
      scheduledArrival: t.scheduledArrival.toISOString(),
      actualDeparture: t.actualDeparture ? t.actualDeparture.toISOString() : '',
      actualArrival: t.actualArrival ? t.actualArrival.toISOString() : '',
      dispatchedBy: `${t.dispatchedBy.firstName} ${t.dispatchedBy.lastName}`,
    }));
  }

  /**
   * Expense Report: All expenses within a date range, grouped by category.
   */
  async expenseReport(dateFrom, dateTo) {
    const expenses = await prisma.expense.findMany({
      where: { expenseDate: { gte: dateFrom, lte: dateTo } },
      include: {
        vehicle: { select: { registrationNumber: true, make: true, model: true } },
        trip: { select: { tripNumber: true } },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { expenseDate: 'asc' },
    });

    const byCategory = {};
    expenses.forEach((e) => {
      if (!byCategory[e.category]) {
        byCategory[e.category] = { count: 0, total: 0, items: [] };
      }
      byCategory[e.category].count++;
      byCategory[e.category].total += parseFloat(e.amount);
      byCategory[e.category].items.push(e);
    });

    // Convert to array and sort by total descending
    const categoryBreakdown = Object.entries(byCategory)
      .map(([category, data]) => ({
        category,
        count: data.count,
        total: parseFloat(data.total.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total);

    const summary = {
      totalExpenses: expenses.length,
      totalAmount: parseFloat(expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)),
      categoryBreakdown,
    };

    return { summary, expenses };
  }

  flattenExpensesForCSV(expenses) {
    return expenses.map((e) => ({
      category: e.category,
      amount: parseFloat(e.amount),
      description: e.description,
      expenseDate: e.expenseDate.toISOString().split('T')[0],
      vehicle: e.vehicle ? e.vehicle.registrationNumber : '',
      trip: e.trip ? e.trip.tripNumber : '',
      recordedBy: `${e.recordedBy.firstName} ${e.recordedBy.lastName}`,
      notes: e.notes || '',
    }));
  }

  /**
   * Fuel Report: Fuel consumption within a date range.
   */
  async fuelReport(dateFrom, dateTo) {
    const logs = await prisma.fuelLog.findMany({
      where: { fuelDate: { gte: dateFrom, lte: dateTo } },
      include: {
        vehicle: { select: { registrationNumber: true, make: true, model: true, fuelType: true } },
        driver: { select: { firstName: true, lastName: true } },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { fuelDate: 'asc' },
    });

    const summary = {
      totalLogs: logs.length,
      totalQuantity: parseFloat(logs.reduce((sum, l) => sum + parseFloat(l.quantity), 0).toFixed(2)),
      totalCost: parseFloat(logs.reduce((sum, l) => sum + parseFloat(l.totalCost), 0).toFixed(2)),
      avgPricePerUnit: logs.length > 0
        ? parseFloat((logs.reduce((sum, l) => sum + parseFloat(l.pricePerUnit), 0) / logs.length).toFixed(2))
        : 0,
    };

    return { summary, logs };
  }

  flattenFuelLogsForCSV(logs) {
    return logs.map((l) => ({
      fuelDate: l.fuelDate.toISOString().split('T')[0],
      vehicle: l.vehicle.registrationNumber,
      vehicleFuelType: l.vehicle.fuelType,
      driver: `${l.driver.firstName} ${l.driver.lastName}`,
      fuelType: l.fuelType,
      quantity: parseFloat(l.quantity),
      pricePerUnit: parseFloat(l.pricePerUnit),
      totalCost: parseFloat(l.totalCost),
      odometerReading: parseFloat(l.odometerReading),
      station: l.station || '',
    }));
  }

  /**
   * Vehicle Utilization Report: Per-vehicle metrics within a date range.
   */
  async vehicleUtilizationReport(dateFrom, dateTo, vehicleId) {
    const vehicleWhere = vehicleId ? { id: vehicleId } : { status: { not: 'RETIRED' } };

    const vehicles = await prisma.vehicle.findMany({
      where: vehicleWhere,
      orderBy: { registrationNumber: 'asc' },
    });

    const report = await Promise.all(
      vehicles.map(async (vehicle) => {
        const [tripCount, completedTrips, totalDistance, fuelCost, maintenanceCost, expenseTotal] = await Promise.all([
          prisma.trip.count({
            where: { vehicleId: vehicle.id, scheduledDeparture: { gte: dateFrom, lte: dateTo } },
          }),
          prisma.trip.count({
            where: { vehicleId: vehicle.id, status: 'COMPLETED', scheduledDeparture: { gte: dateFrom, lte: dateTo } },
          }),
          prisma.trip.aggregate({
            where: { vehicleId: vehicle.id, status: 'COMPLETED', distanceKm: { not: null }, scheduledDeparture: { gte: dateFrom, lte: dateTo } },
            _sum: { distanceKm: true },
          }),
          prisma.fuelLog.aggregate({
            where: { vehicleId: vehicle.id, fuelDate: { gte: dateFrom, lte: dateTo } },
            _sum: { totalCost: true, quantity: true },
          }),
          prisma.maintenanceLog.aggregate({
            where: { vehicleId: vehicle.id, startDate: { gte: dateFrom, lte: dateTo } },
            _sum: { cost: true },
          }),
          prisma.expense.aggregate({
            where: { vehicleId: vehicle.id, expenseDate: { gte: dateFrom, lte: dateTo } },
            _sum: { amount: true },
          }),
        ]);

        const distance = totalDistance._sum.distanceKm ? parseFloat(totalDistance._sum.distanceKm) : 0;
        const fuel = fuelCost._sum.quantity ? parseFloat(fuelCost._sum.quantity) : 0;

        return {
          vehicleId: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          make: vehicle.make,
          model: vehicle.model,
          type: vehicle.type,
          status: vehicle.status,
          currentMileage: parseFloat(vehicle.mileage),
          totalTrips: tripCount,
          completedTrips,
          totalDistanceKm: distance,
          totalFuelQuantity: fuel,
          totalFuelCost: fuelCost._sum.totalCost ? parseFloat(fuelCost._sum.totalCost) : 0,
          totalMaintenanceCost: maintenanceCost._sum.cost ? parseFloat(maintenanceCost._sum.cost) : 0,
          totalExpenses: expenseTotal._sum.amount ? parseFloat(expenseTotal._sum.amount) : 0,
          fuelEfficiency: distance > 0 && fuel > 0 ? parseFloat((distance / fuel).toFixed(2)) : 0,
        };
      })
    );

    return report;
  }

  flattenVehicleUtilizationForCSV(report) {
    return report.map((v) => ({
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      type: v.type,
      status: v.status,
      currentMileage: v.currentMileage,
      totalTrips: v.totalTrips,
      completedTrips: v.completedTrips,
      totalDistanceKm: v.totalDistanceKm,
      totalFuelQuantity: v.totalFuelQuantity,
      totalFuelCost: v.totalFuelCost,
      totalMaintenanceCost: v.totalMaintenanceCost,
      totalExpenses: v.totalExpenses,
      fuelEfficiency: v.fuelEfficiency,
    }));
  }
}

module.exports = new ReportService();
