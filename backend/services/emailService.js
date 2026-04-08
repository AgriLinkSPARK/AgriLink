// services/emailService.js
// Email business logic - Single Responsibility Principle
// Separates email logic from mailer transport

import * as mailer from "../utils/mailer.js";

/**
 * Email Service
 * High-level email operations with error handling
 */
class EmailService {
  /**
   * Send email with error handling (best-effort)
   */
  async sendEmailSafely(emailFunction, ...args) {
    if (process.env.NODE_ENV === "test") {
      return { success: true, skipped: true };
    }

    try {
      await emailFunction(...args);
      return { success: true };
    } catch (error) {
      console.error(`Email sending failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to customer
   */
  async sendCustomerWelcome(email, name) {
    return this.sendEmailSafely(mailer.sendWelcomeEmail, email, name);
  }

  /**
   * Send welcome email to farmer
   */
  async sendFarmerWelcome(email, name, tempPassword = null) {
    return this.sendEmailSafely(mailer.sendFarmerWelcomeEmail, email, name, tempPassword);
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(email, name, orderId, totalPrice) {
    return this.sendEmailSafely(
      mailer.sendOrderConfirmationEmail,
      email,
      name,
      orderId,
      totalPrice
    );
  }

  /**
   * Send order cancellation
   */
  async sendOrderCancellation(email, name, orderId) {
    return this.sendEmailSafely(mailer.sendOrderCancellationEmail, email, name, orderId);
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(email, name, orderId, totalPrice) {
    return this.sendEmailSafely(
      mailer.sendPaymentConfirmationEmail,
      email,
      name,
      orderId,
      totalPrice
    );
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChanged(email, name) {
    return this.sendEmailSafely(mailer.sendPasswordChangedEmail, email, name);
  }
}

// Export singleton instance
export default new EmailService();
