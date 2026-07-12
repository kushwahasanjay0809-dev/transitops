const { z } = require('zod');

const vehicleTypes = ['TRUCK', 'VAN', 'BUS', 'CAR', 'TRAILER'];
const fuelTypes = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'];
const vehicleStatuses = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

const createVehicleSchema = z.object({
  registrationNumber: z
    .string({ required_error: 'Registration number is required' })
    .min(1, 'Registration number is required')
    .max(20, 'Registration number must be at most 20 characters')
    .trim()
    .transform((val) => val.toUpperCase()),
  make: z
    .string({ required_error: 'Make is required' })
    .min(1, 'Make is required')
    .max(100, 'Make must be at most 100 characters')
    .trim(),
  model: z
    .string({ required_error: 'Model is required' })
    .min(1, 'Model is required')
    .max(100, 'Model must be at most 100 characters')
    .trim(),
  year: z
    .number({ required_error: 'Year is required' })
    .int('Year must be an integer')
    .min(1990, 'Year must be 1990 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  type: z
    .enum(vehicleTypes, { required_error: 'Vehicle type is required', invalid_type_error: `Type must be one of: ${vehicleTypes.join(', ')}` }),
  capacityKg: z
    .number({ required_error: 'Capacity is required' })
    .positive('Capacity must be greater than 0'),
  fuelType: z
    .enum(fuelTypes, { required_error: 'Fuel type is required', invalid_type_error: `Fuel type must be one of: ${fuelTypes.join(', ')}` }),
  status: z
    .enum(vehicleStatuses)
    .optional()
    .default('AVAILABLE'),
  mileage: z
    .number()
    .min(0, 'Mileage cannot be negative')
    .optional()
    .default(0),
  insuranceExpiry: z
    .coerce.date()
    .optional()
    .nullable(),
  lastServiceDate: z
    .coerce.date()
    .optional()
    .nullable(),
});

const updateVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, 'Registration number cannot be empty')
    .max(20, 'Registration number must be at most 20 characters')
    .trim()
    .transform((val) => val.toUpperCase())
    .optional(),
  make: z
    .string()
    .min(1, 'Make cannot be empty')
    .max(100)
    .trim()
    .optional(),
  model: z
    .string()
    .min(1, 'Model cannot be empty')
    .max(100)
    .trim()
    .optional(),
  year: z
    .number()
    .int()
    .min(1990)
    .max(2100)
    .optional(),
  type: z
    .enum(vehicleTypes)
    .optional(),
  capacityKg: z
    .number()
    .positive('Capacity must be greater than 0')
    .optional(),
  fuelType: z
    .enum(fuelTypes)
    .optional(),
  status: z
    .enum(vehicleStatuses)
    .optional(),
  mileage: z
    .number()
    .min(0, 'Mileage cannot be negative')
    .optional(),
  insuranceExpiry: z
    .coerce.date()
    .optional()
    .nullable(),
  lastServiceDate: z
    .coerce.date()
    .optional()
    .nullable(),
});

const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'registrationNumber', 'make', 'model', 'year', 'mileage', 'capacityKg']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(vehicleStatuses).optional(),
  type: z.enum(vehicleTypes).optional(),
  fuelType: z.enum(fuelTypes).optional(),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
  vehicleTypes,
  fuelTypes,
  vehicleStatuses,
};
