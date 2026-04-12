// services/authService.js
// Business logic layer - Single Responsibility Principle & Dependency Inversion

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Store from "../models/Store.js";
import { AppError } from "../utils/errorHandler.js";
import { USER_ROLES, ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const otpSessions = new Map();

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
    const { user, hasStore } = await this.authenticateUserForLogin(
      email,
      password,
      allowedRoles
    );

    return {
      token: this.generateToken(user),
      role: user.role,
      hasStore,
      twoStepEnabled: !!user.twoStepEnabled,
    };
  }

  /**
   * Validate credentials + role and collect login metadata
   */
  async authenticateUserForLogin(email, password, allowedRoles = null) {
    const user = await this.validateCredentials(email, password);

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const message = user.role === USER_ROLES.CUSTOMER
        ? ERROR_MESSAGES.USE_ADMIN_FARMER_LOGIN
        : ERROR_MESSAGES.USE_CUSTOMER_LOGIN;
      throw new AppError(message, HTTP_STATUS.FORBIDDEN);
    }

    let hasStore = null;
    if (user.role === USER_ROLES.FARMER) {
      hasStore = await this.checkUserStore(user._id);
    }

    return { user, hasStore };
  }

  /**
   * Generate numeric OTP
   */
  generateOTP(length = 6) {
    return String(crypto.randomInt(0, 10 ** length)).padStart(length, "0");
  }

  hashOTP(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  createOtpSession(user, hasStore, otp) {
    const otpSessionId = crypto.randomUUID();
    const expiresAt = Date.now() + OTP_TTL_MS;

    otpSessions.set(otpSessionId, {
      userId: String(user._id),
      role: user.role,
      hasStore,
      otpHash: this.hashOTP(otp),
      expiresAt,
    });

    return { otpSessionId, expiresIn: Math.floor(OTP_TTL_MS / 1000) };
  }

  clearExpiredOtpSessions() {
    const now = Date.now();
    for (const [sessionId, session] of otpSessions.entries()) {
      if (session.expiresAt <= now) {
        otpSessions.delete(sessionId);
      }
    }
  }

  async prepareTwoStepLogin(email, password, allowedRoles = null) {
    const { user, hasStore } = await this.authenticateUserForLogin(
      email,
      password,
      allowedRoles
    );

    return this.prepareTwoStepForUser(user, hasStore);
  }

  prepareTwoStepForUser(user, hasStore = null) {
    const otp = this.generateOTP();
    const session = this.createOtpSession(user, hasStore, otp);
    return { user, otp, ...session };
  }

  isTwoStepEnabled(user) {
    return !!user?.twoStepEnabled;
  }

  async updateTwoStepPreference(userId, enabled) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    user.twoStepEnabled = Boolean(enabled);
    await user.save();

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      twoStepEnabled: user.twoStepEnabled,
    };
  }

  async getTwoStepPreference(userId) {
    const user = await User.findById(userId).select("twoStepEnabled email role");
    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      twoStepEnabled: !!user.twoStepEnabled,
    };
  }

  verifyTwoStepOtp(otpSessionId, otp) {
    this.clearExpiredOtpSessions();

    const session = otpSessions.get(otpSessionId);
    if (!session) {
      throw new AppError("OTP session expired or invalid", HTTP_STATUS.BAD_REQUEST);
    }

    const isValidOtp = this.hashOTP(otp) === session.otpHash;
    if (!isValidOtp) {
      throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
    }

    otpSessions.delete(otpSessionId);

    const token = jwt.sign(
      { id: session.userId, role: session.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return {
      token,
      role: session.role,
      hasStore: session.hasStore,
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
