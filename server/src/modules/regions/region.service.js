const { prisma } = require('../../config/database');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'name', 'code', 'state'];

class RegionService {
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS, 'name');

    const where = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { code: { contains: query.search } },
        { state: { contains: query.search } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const [regions, total] = await Promise.all([
      prisma.region.findMany({ where, skip, take, orderBy: { [field]: order } }),
      prisma.region.count({ where }),
    ]);

    return { data: regions, meta: buildPaginationMeta(total, page, limit) };
  }

  async getAll() {
    return prisma.region.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, state: true },
    });
  }

  async getById(id) {
    const region = await prisma.region.findUnique({ where: { id } });
    if (!region) throw AppError.notFound('Region not found');
    return region;
  }

  async create(data) {
    const existingName = await prisma.region.findUnique({ where: { name: data.name } });
    if (existingName) throw AppError.conflict('A region with this name already exists');

    const existingCode = await prisma.region.findUnique({ where: { code: data.code } });
    if (existingCode) throw AppError.conflict('A region with this code already exists');

    return prisma.region.create({ data });
  }

  async update(id, data) {
    const existing = await prisma.region.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Region not found');

    if (data.name && data.name !== existing.name) {
      const dup = await prisma.region.findUnique({ where: { name: data.name } });
      if (dup) throw AppError.conflict('A region with this name already exists');
    }

    if (data.code && data.code !== existing.code) {
      const dup = await prisma.region.findUnique({ where: { code: data.code } });
      if (dup) throw AppError.conflict('A region with this code already exists');
    }

    return prisma.region.update({ where: { id }, data });
  }

  async delete(id) {
    const existing = await prisma.region.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Region not found');

    const tripCount = await prisma.trip.count({
      where: { OR: [{ originRegionId: id }, { destinationRegionId: id }] },
    });

    if (tripCount > 0) {
      throw AppError.badRequest(`Cannot delete region used in ${tripCount} trip(s)`);
    }

    await prisma.region.delete({ where: { id } });
    return { message: 'Region deleted successfully' };
  }
}

module.exports = new RegionService();
