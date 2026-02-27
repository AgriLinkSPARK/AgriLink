import axios from 'axios';

/**
 * SMS Service for AgriLink
 * Uses Dialog Ideamart as primary provider
 * Twilio can remain as backup if needed
 */

class SMSService {
  /**
   * Send SMS using Dialog Ideamart
   * @param {string} phoneNumber - Recipient phone number (with country code, e.g., +94712345678)
   * @param {string} message - SMS message content
   * @returns {Promise<object>} Response from SMS provider
   */
  static async sendSMS(phoneNumber, message) {
    try {
      return await this.sendViaDialog(phoneNumber, message);
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      throw new Error('Failed to send SMS. Please try again later.');
    }
  }

  /**
   * Send SMS via Dialog Ideamart
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - SMS message content
   * @returns {Promise<object>}
   */
  static async sendViaDialog(phoneNumber, message) {
    const apiUrl = process.env.DIALOG_SMS_API_URL;
    const apiToken = process.env.DIALOG_API_TOKEN;
    const sourceAddress = process.env.DIALOG_SOURCE_ADDRESS || 'AgriLink';

    if (!apiUrl || !apiToken) {
      throw new Error('Dialog SMS is not configured. Set DIALOG_SMS_API_URL and DIALOG_API_TOKEN in .env');
    }
    
    // Ensure phone number is in correct format
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+94${phoneNumber.replace(/^0/, '')}`; // Convert 0712345678 to +94712345678

    const payload = {
      destination: formattedNumber,
      message: message,
      sourceAddress: sourceAddress
    };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ SMS sent successfully to ${formattedNumber}`);
      return {
        success: true,
        provider: 'Dialog Ideamart',
        response: response.data
      };
    } catch (error) {
      console.error('Dialog SMS error:', error.response?.data || error.message);
      throw new Error(`Dialog SMS failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code
   * @returns {Promise<object>}
   */
  static async sendOTP(phoneNumber, otp) {
    const message = `Your AgriLink verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send order confirmation SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} orderNumber - Order number
   * @returns {Promise<object>}
   */
  static async sendOrderConfirmation(phoneNumber, orderNumber) {
    const message = `Your AgriLink order #${orderNumber} has been confirmed. Thank you for your purchase!`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send order status update SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} orderNumber - Order number
   * @param {string} status - New status
   * @returns {Promise<object>}
   */
  static async sendOrderStatusUpdate(phoneNumber, orderNumber, status) {
    const message = `Your AgriLink order #${orderNumber} is now ${status}.`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send delivery notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} orderNumber - Order number
   * @param {string} trackingInfo - Tracking information
   * @returns {Promise<object>}
   */
  static async sendDeliveryNotification(phoneNumber, orderNumber, trackingInfo) {
    const message = `Your AgriLink order #${orderNumber} is out for delivery. Track: ${trackingInfo}`;
    return await this.sendSMS(phoneNumber, message);
  }
}

export default SMSService;
