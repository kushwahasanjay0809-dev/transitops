const { z } = require('zod');

const tripStatuses = ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const createTripSchema = z.object({
  vehicleId: z
    .number({ required_error: 'Vehicle ID is required' })
    .int()
    .positive('Vehicle ID must be a positive integer'),
  driverId: z
    .number({ required_error: 'Driver ID is required' })
    .int()
    .positive('Driver ID must be a positive integer'),
  originRegionId: z
    .number({ required_error: 'Origin region is required' })
    .int()
    .positive(),
  destinationRegionId: z
    .number({ required_error: 'Destination region is required' })
    .int()
    .positive(),
  cargoDescription: z
    .string()
    .max(500, 'Cargo description must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
  cargoWeightKg: z
    .number()
    .min(0, 'Cargo weight cannot be negative')
    .optional()
    .nullable(),
  distanceKm: z
    .number()
    .min(0, 'Distance cannot be negative')
    .optional()
    .nullable(),
  scheduledDeparture: z
    .coerce.date({ required_error: 'Scheduled departure is required' }),
  scheduledArrival: z
    .coerce.date({ required_error: 'Scheduled arrival is required' }),
  notes: z
    .string()
    .max(2000, 'Notes must be at most 2000 characters')
    .trim()
    .optional()
    .nullable(),
}).refine((data) => data.scheduledArrival > data.scheduledDeparture, {
  message: 'Scheduled arrival must be after scheduled departure',
  path: ['scheduledArrival'],
}).refine((data) => data.originRegionId !== data.destinationRegionId, {
  message: 'Origin and destination regions must be different',
  path: ['destinationRegionId'],
});

const updateTripSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  driverId: z.number().int().positive().optional(),
  originRegionId: z.number().int().positive().optional(),
  destinationRegionId: z.number().int().positive().optional(),
  cargoDescription: z.string().max(500).trim().optional().nullable(),
  cargoWeightKg: z.number().min(0).optional().nullable(),
  distanceKm: z.number().min(0).optional().nullable(),
  scheduledDeparture: z.coerce.date().optional(),
  scheduledArrival: z.coerce.date().optional(),
  notes: z.string().max(2000).trim().optional().nullable(),
});

const dispatchTripSchema = z.object({
  actualDeparture: z
    .coerce.date()
    .optional()
    .default(() => new Date()),
});

const completeTripSchema = z.object({
  actualArrival: z
    .coerce.date()
    .optional()
    .default(() => new Date()),
  distanceKm: z
    .number()
    .min(0, 'Distance cannot be negative')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000)
    .trim()
    .optional()
    .nullable(),
});

const cancelTripSchema = z.object({
  reason: z
    .string({ required_error: 'Cancellation reason is required' })
    .min(1, 'Cancellation reason is required')
    .max(500, 'Reason must be at most 500 characters')
    .trim(),
});

const tripQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'tripNumber', 'scheduledDeparture', 'scheduledArrival', 'status', 'distanceKm']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(tripStatuses).optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
  driverId: z.coerce.number().int().positive().optional(),
  originRegionId: z.coerce.number().int().positive().optional(),
  destinationRegionId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

module.exports = {
  createTripSchema,
  updateTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  cancelTripSchema,
  tripQuerySchema,
  tripStatuses,
};
