/**
 * Pagination utility.
 * Parses query params and returns Prisma-compatible skip/take + response metadata.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from the request query.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number, take: number }}
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Validate and clamp values
  page = isNaN(page) || page < 1 ? DEFAULT_PAGE : page;
  limit = isNaN(limit) || limit < 1 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);

  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

/**
 * Build pagination metadata for the response.
 * @param {number} total - Total record count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {{ page: number, limit: number, total: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean }}
 */
function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse sort parameters from the request query.
 * @param {object} query - Express req.query
 * @param {string[]} allowedFields - Fields that can be sorted
 * @param {string} defaultField - Default sort field
 * @returns {{ field: string, order: 'asc' | 'desc' }}
 */
function parseSort(query, allowedFields, defaultField = 'createdAt') {
  const field = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { field, order };
}

module.exports = { parsePagination, buildPaginationMeta, parseSort };
