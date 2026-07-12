const { z } = require('zod');

const maintenanceTypes = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'];
const maintenanceStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const createMaintenanceSchema = z.object({
  vehicleId: z
    .number({ required_error: 'Vehicle ID is required' })
    .int()
    .positive(),
  type: z
    .enum(maintenanceTypes, { required_error: 'Maintenance type is required' }),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description is required')
    .max(5000, 'Description must be at most 5000 characters')
    .trim(),
  cost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .default(0),
  startDate: z
    .coerce.date({ required_error: 'Start date is required' }),
  endDate: z
    .coerce.date()
    .optional()
    .nullable(),
  vendorName: z
    .string()
    .max(255, 'Vendor name must be at most 255 characters')
    .trim()
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000)
    .trim()
    .optional()
    .nullable(),
});

const updateMaintenanceSchema = z.object({
  type: z.enum(maintenanceTypes).optional(),
  description: z.string().min(1).max(5000).trim().optional(),
  status: z.enum(maintenanceStatuses).optional(),
  cost: z.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  vendorName: z.string().max(255).trim().optional().nullable(),
  notes: z.string().max(2000).trim().optional().nullable(),
});

const maintenanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'cost', 'type', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(maintenanceStatuses).optional(),
  type: z.enum(maintenanceTypes).optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceQuerySchema,
  maintenanceTypes,
  maintenanceStatuses,
};
