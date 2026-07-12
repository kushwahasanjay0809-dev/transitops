const { z } = require('zod');

const createRegionSchema = z.object({
  name: z
    .string({ required_error: 'Region name is required' })
    .min(1, 'Region name is required')
    .max(255, 'Region name must be at most 255 characters')
    .trim(),
  code: z
    .string({ required_error: 'Region code is required' })
    .min(1, 'Region code is required')
    .max(10, 'Region code must be at most 10 characters')
    .trim()
    .transform((val) => val.toUpperCase()),
  state: z
    .string()
    .max(100)
    .trim()
    .optional()
    .nullable(),
  country: z
    .string()
    .max(100)
    .trim()
    .optional()
    .default('India'),
  isActive: z
    .boolean()
    .optional()
    .default(true),
});

const updateRegionSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  code: z.string().min(1).max(10).trim().transform((val) => val.toUpperCase()).optional(),
  state: z.string().max(100).trim().optional().nullable(),
  country: z.string().max(100).trim().optional(),
  isActive: z.boolean().optional(),
});

const regionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'name', 'code', 'state']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
});

module.exports = { createRegionSchema, updateRegionSchema, regionQuerySchema };
