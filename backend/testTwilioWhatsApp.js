import dotenv from 'dotenv';
import whatsappService from './services/whatsappService.js';

dotenv.config();

async function testTwilioWhatsApp() {
  try {
    console.log('Testing Twilio WhatsApp template message...');
    console.log('From:', process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886');
    console.log('Content SID:', process.env.TWILIO_WHATSAPP_CONTENT_SID);

    const to = process.env.TWILIO_WHATSAPP_TEST_TO || '+94771032248';
    const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID || 'HXb5b62575e6e4ff6129ad7c8efe1f983e';
    const contentVariables = process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES || '{"1":"12/1","2":"3pm"}';

    const result = await whatsappService.sendTemplateMessage(to, contentSid, contentVariables);

    console.log('✅ WhatsApp template message sent successfully!');
    console.log('SID:', result.sid);
    console.log('Status:', result.status);
    console.log('To:', result.to);
    console.log('From:', result.from);
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:');
    console.error('Message:', error.message);

    if (error.message.includes('63015')) {
      console.error('⚠️ Recipient is not joined to Twilio WhatsApp sandbox yet.');
    }
  }
}

testTwilioWhatsApp();
