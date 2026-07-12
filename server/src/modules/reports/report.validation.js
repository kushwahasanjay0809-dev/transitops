const { z } = require('zod');

const reportDateRangeSchema = z.object({
  dateFrom: z.coerce.date({ required_error: 'Start date is required' }),
  dateTo: z.coerce.date({ required_error: 'End date is required' }),
  format: z.enum(['json', 'csv']).optional().default('json'),
}).refine((data) => data.dateTo >= data.dateFrom, {
  message: 'End date must be on or after start date',
  path: ['dateTo'],
});

const vehicleReportQuerySchema = z.object({
  dateFrom: z.coerce.date({ required_error: 'Start date is required' }),
  dateTo: z.coerce.date({ required_error: 'End date is required' }),
  format: z.enum(['json', 'csv']).optional().default('json'),
  vehicleId: z.coerce.number().int().positive().optional(),
});

module.exports = { reportDateRangeSchema, vehicleReportQuerySchema };
