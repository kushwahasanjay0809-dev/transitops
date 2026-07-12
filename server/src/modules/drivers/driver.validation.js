const { z } = require('zod');

const driverStatuses = ['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED'];
const licenseTypes = ['A', 'B', 'C', 'D', 'E'];

const createDriverSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .max(100, 'First name must be at most 100 characters')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(100, 'Last name must be at most 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .transform((val) => val.toLowerCase().trim()),
  phone: z
    .string({ required_error: 'Phone is required' })
    .min(1, 'Phone is required')
    .max(20, 'Phone must be at most 20 characters')
    .trim(),
  licenseNumber: z
    .string({ required_error: 'License number is required' })
    .min(1, 'License number is required')
    .max(50, 'License number must be at most 50 characters')
    .trim()
    .transform((val) => val.toUpperCase()),
  licenseExpiry: z
    .coerce.date({ required_error: 'License expiry date is required' }),
  licenseType: z
    .enum(licenseTypes, { required_error: 'License type is required', invalid_type_error: `License type must be one of: ${licenseTypes.join(', ')}` }),
  status: z
    .enum(driverStatuses)
    .optional()
    .default('AVAILABLE'),
  dateOfBirth: z
    .coerce.date({ required_error: 'Date of birth is required' }),
  hireDate: z
    .coerce.date({ required_error: 'Hire date is required' }),
  address: z
    .string()
    .max(1000, 'Address must be at most 1000 characters')
    .trim()
    .optional()
    .nullable(),
  emergencyContact: z
    .string()
    .max(20, 'Emergency contact must be at most 20 characters')
    .trim()
    .optional()
    .nullable(),
});

const updateDriverSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().max(255).transform((val) => val.toLowerCase().trim()).optional(),
  phone: z.string().min(1).max(20).trim().optional(),
  licenseNumber: z.string().min(1).max(50).trim().transform((val) => val.toUpperCase()).optional(),
  licenseExpiry: z.coerce.date().optional(),
  licenseType: z.enum(licenseTypes).optional(),
  status: z.enum(driverStatuses).optional(),
  dateOfBirth: z.coerce.date().optional(),
  hireDate: z.coerce.date().optional(),
  address: z.string().max(1000).trim().optional().nullable(),
  emergencyContact: z.string().max(20).trim().optional().nullable(),
});

const driverQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'licenseNumber', 'licenseExpiry', 'hireDate']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(driverStatuses).optional(),
  licenseType: z.enum(licenseTypes).optional(),
  licenseExpired: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
});

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  driverQuerySchema,
  driverStatuses,
  licenseTypes,
};
