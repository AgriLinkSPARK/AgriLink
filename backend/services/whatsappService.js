import twilio from 'twilio';

class WhatsAppService {
  getClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment variables');
    }

    return twilio(accountSid, authToken);
  }

  formatWhatsAppNumber(phoneNumber) {
    const normalized = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+94${phoneNumber.replace(/^0/, '')}`;

    return normalized.startsWith('whatsapp:') ? normalized : `whatsapp:${normalized}`;
  }

  async sendMessage(to, body) {
    try {
      const client = this.getClient();
      const toWhatsApp = this.formatWhatsAppNumber(to);
      const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      const fromWhatsApp = fromNumber.startsWith('whatsapp:')
        ? fromNumber
        : `whatsapp:${fromNumber}`;

      const message = await client.messages.create({
        from: fromWhatsApp,
        to: toWhatsApp,
        body
      });

      return {
        success: true,
        provider: 'Twilio WhatsApp',
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from
      };
    } catch (error) {
      throw new Error(`Twilio WhatsApp send failed: ${error.message}`);
    }
  }

  async sendTemplateMessage(to, contentSid, contentVariables = {}) {
    try {
      const client = this.getClient();
      const toWhatsApp = this.formatWhatsAppNumber(to);
      const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      const fromWhatsApp = fromNumber.startsWith('whatsapp:')
        ? fromNumber
        : `whatsapp:${fromNumber}`;

      const variablesPayload =
        typeof contentVariables === 'string'
          ? contentVariables
          : JSON.stringify(contentVariables);

      const message = await client.messages.create({
        from: fromWhatsApp,
        contentSid,
        contentVariables: variablesPayload,
        to: toWhatsApp
      });

      return {
        success: true,
        provider: 'Twilio WhatsApp',
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from
      };
    } catch (error) {
      throw new Error(`Twilio WhatsApp template send failed: ${error.message}`);
    }
  }

  async sendOTP(phoneNumber, otp) {
    const body = `Your AgriLink verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendMessage(phoneNumber, body);
  }

  async sendOrderConfirmation(phoneNumber, orderNumber) {
    const body = `Your AgriLink order #${orderNumber} has been confirmed.`;
    return this.sendMessage(phoneNumber, body);
  }

  async sendOrderStatusUpdate(phoneNumber, orderNumber, status) {
    const body = `Your AgriLink order #${orderNumber} is now ${status}.`;
    return this.sendMessage(phoneNumber, body);
  }
}

export default new WhatsAppService();
