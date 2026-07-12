const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const env = require('../../config/env');
const AppError = require('../../utils/appError');

class AuthService {
  /**
   * Authenticate user with email and password.
   * Returns JWT token and user profile on success.
   */
  async login(email, password) {
    // Find user by email, include role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Account is deactivated. Contact an administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = this.generateToken(user);

    // Return token + sanitized user data (no password)
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Get current user's profile.
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Change the current user's password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, env.bcryptSaltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Register a new user with the MANAGER role.
   */
  async register(fullName, email, password) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw AppError.conflict('Email is already registered');
    }

    // Find MANAGER role
    const managerRole = await prisma.role.findUnique({
      where: { name: 'MANAGER' },
    });

    if (!managerRole) {
      throw AppError.internal('Manager role not found in database');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

    // Split name into firstName and lastName
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        roleId: managerRole.id,
        isActive: true,
      },
      include: { role: true },
    });

    // Return sanitized user
    return this.sanitizeUser(newUser);
  }

  /**
   * Generate a JWT token for the given user.
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
  }

  /**
   * Remove sensitive fields from user object.
   */
  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new AuthService();
