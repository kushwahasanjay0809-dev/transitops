const { z } = require('zod');

const expenseCategories = ['FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLLS', 'FINES', 'SALARY', 'MISCELLANEOUS'];

const createExpenseSchema = z.object({
  vehicleId: z.number().int().positive().optional().nullable(),
  tripId: z.number().int().positive().optional().nullable(),
  category: z.enum(expenseCategories, { required_error: 'Category is required' }),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description is required')
    .max(500, 'Description must be at most 500 characters')
    .trim(),
  expenseDate: z.coerce.date({ required_error: 'Expense date is required' }),
  receiptUrl: z.string().max(500).trim().optional().nullable(),
  notes: z.string().max(2000).trim().optional().nullable(),
});

const updateExpenseSchema = z.object({
  vehicleId: z.number().int().positive().optional().nullable(),
  tripId: z.number().int().positive().optional().nullable(),
  category: z.enum(expenseCategories).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(500).trim().optional(),
  expenseDate: z.coerce.date().optional(),
  receiptUrl: z.string().max(500).trim().optional().nullable(),
  notes: z.string().max(2000).trim().optional().nullable(),
});

const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'expenseDate', 'amount', 'category']).optional().default('expenseDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  category: z.enum(expenseCategories).optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
  tripId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema, expenseQuerySchema, expenseCategories };
