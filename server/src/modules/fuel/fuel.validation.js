const { z } = require('zod');

const fuelTypes = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'];

const createFuelLogSchema = z.object({
  vehicleId: z.number({ required_error: 'Vehicle ID is required' }).int().positive(),
  driverId: z.number({ required_error: 'Driver ID is required' }).int().positive(),
  fuelDate: z.coerce.date({ required_error: 'Fuel date is required' }),
  fuelType: z.enum(fuelTypes, { required_error: 'Fuel type is required' }),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .positive('Quantity must be greater than 0'),
  pricePerUnit: z
    .number({ required_error: 'Price per unit is required' })
    .positive('Price per unit must be greater than 0'),
  totalCost: z
    .number({ required_error: 'Total cost is required' })
    .positive('Total cost must be greater than 0'),
  odometerReading: z
    .number({ required_error: 'Odometer reading is required' })
    .min(0, 'Odometer reading cannot be negative'),
  station: z.string().max(255).trim().optional().nullable(),
  notes: z.string().max(2000).trim().optional().nullable(),
});

const updateFuelLogSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  driverId: z.number().int().positive().optional(),
  fuelDate: z.coerce.date().optional(),
  fuelType: z.enum(fuelTypes).optional(),
  quantity: z.number().positive().optional(),
  pricePerUnit: z.number().positive().optional(),
  totalCost: z.number().positive().optional(),
  odometerReading: z.number().min(0).optional(),
  station: z.string().max(255).trim().optional().nullable(),
  notes: z.string().max(2000).trim().optional().nullable(),
});

const fuelLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'fuelDate', 'totalCost', 'quantity', 'odometerReading']).optional().default('fuelDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  vehicleId: z.coerce.number().int().positive().optional(),
  driverId: z.coerce.number().int().positive().optional(),
  fuelType: z.enum(fuelTypes).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

module.exports = { createFuelLogSchema, updateFuelLogSchema, fuelLogQuerySchema, fuelTypes };
