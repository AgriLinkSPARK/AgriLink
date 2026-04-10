// services/authService.js
// Business logic layer - Single Responsibility Principle & Dependency Inversion

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Store from "../models/Store.js";
import { AppError } from "../utils/errorHandler.js";
import { USER_ROLES, ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare passwords
   */
  async comparePasswords(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    console.log(`[LOGIN] Found user ${email}, stored hash length: ${user.password.length}`);
    const isPasswordValid = await this.comparePasswords(password, user.password);
    console.log(`[LOGIN] Password comparison result for ${email}: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log(`[LOGIN] Invalid password for ${email}`);
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    return user;
  }

  /**
   * Check if user has store (for farmers)
   */
  async checkUserStore(userId) {
    const store = await Store.findOne({ farmer: userId });
    return !!store;
  }

  /**
   * Register new user
   */
  async registerUser(userData) {
    const { name, email, password, role = USER_ROLES.CUSTOMER } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return user;
  }

  /**
   * Login user and generate response
   */
  async loginUser(email, password, allowedRoles = null) {
    const user = await this.validateCredentials(email, password);

    // Role validation
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const message = user.role === USER_ROLES.CUSTOMER
        ? ERROR_MESSAGES.USE_ADMIN_FARMER_LOGIN
        : ERROR_MESSAGES.USE_CUSTOMER_LOGIN;
      throw new AppError(message, HTTP_STATUS.FORBIDDEN);
    }

    // Check for store if farmer
    let hasStore = null;
    if (user.role === USER_ROLES.FARMER) {
      hasStore = await this.checkUserStore(user._id);
    }

    return {
      token: this.generateToken(user),
      role: user.role,
      hasStore,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }
}

// Export singleton instance
export default new AuthService();
