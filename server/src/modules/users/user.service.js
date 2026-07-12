const bcrypt = require('bcrypt');
const { prisma } = require('../../config/database');
const env = require('../../config/env');
const AppError = require('../../utils/appError');
const { parsePagination, buildPaginationMeta, parseSort } = require('../../utils/pagination');

const SORTABLE_FIELDS = ['createdAt', 'firstName', 'lastName', 'email'];

class UserService {
  /**
   * List all users with pagination, search, and filtering.
   */
  async list(query) {
    const { skip, take, page, limit } = parsePagination(query);
    const { field, order } = parseSort(query, SORTABLE_FIELDS);

    // Build where clause
    const where = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }

    if (query.roleId) {
      where.roleId = parseInt(query.roleId, 10);
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
        include: { role: { select: { id: true, name: true, description: true } } },
        omit: { password: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get a single user by ID.
   */
  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: { select: { id: true, name: true, description: true } } },
      omit: { password: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Create a new user.
   */
  async create(data) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw AppError.conflict('A user with this email already exists');
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw AppError.badRequest('Invalid role ID');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, env.bcryptSaltRounds);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: { role: { select: { id: true, name: true, description: true } } },
      omit: { password: true },
    });

    return user;
  }

  /**
   * Update an existing user.
   */
  async update(id, data) {
    // Check user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw AppError.notFound('User not found');
    }

    // If email is being changed, check uniqueness
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) {
        throw AppError.conflict('A user with this email already exists');
      }
    }

    // If roleId is being changed, verify it exists
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw AppError.badRequest('Invalid role ID');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { role: { select: { id: true, name: true, description: true } } },
      omit: { password: true },
    });

    return user;
  }

  /**
   * Delete a user by ID.
   * Prevents deletion of the last admin.
   */
  async delete(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Prevent deleting the last admin
    if (user.role.name === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: { name: 'ADMIN' } },
      });

      if (adminCount <= 1) {
        throw AppError.badRequest('Cannot delete the last admin user');
      }
    }

    await prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  /**
   * Get all roles for dropdown/selection.
   */
  async getRoles() {
    return prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
  }
}

module.exports = new UserService();
