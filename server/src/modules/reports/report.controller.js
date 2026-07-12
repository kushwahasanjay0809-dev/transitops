const reportService = require('./report.service');
const ApiResponse = require('../../utils/apiResponse');
const { toCSV, sendCSV } = require('../../utils/csvExport');

// CSV column definitions for each report
const TRIP_CSV_COLUMNS = ['tripNumber', 'status', 'vehicle', 'vehicleType', 'driver', 'origin', 'destination', 'cargoDescription', 'cargoWeightKg', 'distanceKm', 'scheduledDeparture', 'scheduledArrival', 'actualDeparture', 'actualArrival', 'dispatchedBy'];
const TRIP_CSV_HEADERS = { tripNumber: 'Trip #', status: 'Status', vehicle: 'Vehicle', vehicleType: 'Type', driver: 'Driver', origin: 'Origin', destination: 'Destination', cargoDescription: 'Cargo', cargoWeightKg: 'Weight (kg)', distanceKm: 'Distance (km)', scheduledDeparture: 'Sched. Departure', scheduledArrival: 'Sched. Arrival', actualDeparture: 'Actual Departure', actualArrival: 'Actual Arrival', dispatchedBy: 'Dispatched By' };

const EXPENSE_CSV_COLUMNS = ['category', 'amount', 'description', 'expenseDate', 'vehicle', 'trip', 'recordedBy', 'notes'];
const EXPENSE_CSV_HEADERS = { category: 'Category', amount: 'Amount (₹)', description: 'Description', expenseDate: 'Date', vehicle: 'Vehicle', trip: 'Trip #', recordedBy: 'Recorded By', notes: 'Notes' };

const FUEL_CSV_COLUMNS = ['fuelDate', 'vehicle', 'driver', 'fuelType', 'quantity', 'pricePerUnit', 'totalCost', 'odometerReading', 'station'];
const FUEL_CSV_HEADERS = { fuelDate: 'Date', vehicle: 'Vehicle', driver: 'Driver', fuelType: 'Fuel Type', quantity: 'Quantity (L)', pricePerUnit: 'Price/Unit (₹)', totalCost: 'Total Cost (₹)', odometerReading: 'Odometer (km)', station: 'Station' };

const UTILIZATION_CSV_COLUMNS = ['registrationNumber', 'make', 'model', 'type', 'status', 'currentMileage', 'totalTrips', 'completedTrips', 'totalDistanceKm', 'totalFuelQuantity', 'totalFuelCost', 'totalMaintenanceCost', 'totalExpenses', 'fuelEfficiency'];
const UTILIZATION_CSV_HEADERS = { registrationNumber: 'Reg. Number', make: 'Make', model: 'Model', type: 'Type', status: 'Status', currentMileage: 'Mileage (km)', totalTrips: 'Total Trips', completedTrips: 'Completed', totalDistanceKm: 'Distance (km)', totalFuelQuantity: 'Fuel (L)', totalFuelCost: 'Fuel Cost (₹)', totalMaintenanceCost: 'Maint. Cost (₹)', totalExpenses: 'Total Expenses (₹)', fuelEfficiency: 'Fuel Eff. (km/L)' };

class ReportController {
  /**
   * GET /api/reports/trips
   */
  async tripReport(req, res, next) {
    try {
      const { dateFrom, dateTo, format } = req.query;
      const result = await reportService.tripReport(new Date(dateFrom), new Date(dateTo));

      if (format === 'csv') {
        const flat = reportService.flattenTripsForCSV(result.trips);
        const csv = toCSV(flat, TRIP_CSV_COLUMNS, TRIP_CSV_HEADERS);
        return sendCSV(res, csv, 'trip_report');
      }

      ApiResponse.success(res, { message: 'Trip report generated successfully', data: result });
    } catch (error) { next(error); }
  }

  /**
   * GET /api/reports/expenses
   */
  async expenseReport(req, res, next) {
    try {
      const { dateFrom, dateTo, format } = req.query;
      const result = await reportService.expenseReport(new Date(dateFrom), new Date(dateTo));

      if (format === 'csv') {
        const flat = reportService.flattenExpensesForCSV(result.expenses);
        const csv = toCSV(flat, EXPENSE_CSV_COLUMNS, EXPENSE_CSV_HEADERS);
        return sendCSV(res, csv, 'expense_report');
      }

      ApiResponse.success(res, { message: 'Expense report generated successfully', data: result });
    } catch (error) { next(error); }
  }

  /**
   * GET /api/reports/fuel
   */
  async fuelReport(req, res, next) {
    try {
      const { dateFrom, dateTo, format } = req.query;
      const result = await reportService.fuelReport(new Date(dateFrom), new Date(dateTo));

      if (format === 'csv') {
        const flat = reportService.flattenFuelLogsForCSV(result.logs);
        const csv = toCSV(flat, FUEL_CSV_COLUMNS, FUEL_CSV_HEADERS);
        return sendCSV(res, csv, 'fuel_report');
      }

      ApiResponse.success(res, { message: 'Fuel report generated successfully', data: result });
    } catch (error) { next(error); }
  }

  /**
   * GET /api/reports/vehicle-utilization
   */
  async vehicleUtilizationReport(req, res, next) {
    try {
      const { dateFrom, dateTo, format, vehicleId } = req.query;
      const result = await reportService.vehicleUtilizationReport(
        new Date(dateFrom),
        new Date(dateTo),
        vehicleId ? parseInt(vehicleId, 10) : null
      );

      if (format === 'csv') {
        const flat = reportService.flattenVehicleUtilizationForCSV(result);
        const csv = toCSV(flat, UTILIZATION_CSV_COLUMNS, UTILIZATION_CSV_HEADERS);
        return sendCSV(res, csv, 'vehicle_utilization_report');
      }

      ApiResponse.success(res, { message: 'Vehicle utilization report generated successfully', data: result });
    } catch (error) { next(error); }
  }
}

module.exports = new ReportController();
