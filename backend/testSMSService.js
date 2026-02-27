import dotenv from 'dotenv';
import whatsappService from './services/whatsappService.js';

dotenv.config();

async function testSMSService() {
  const to = process.env.TWILIO_WHATSAPP_TEST_TO || '+94771032248';
  const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;
  const contentVariables = process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES || '{"1":"12/1","2":"3pm"}';

  console.log('--- AgriLink Message Delivery Test ---');
  console.log('Provider: Twilio WhatsApp');
  console.log('From:', process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886');
  console.log('To:', to);

  try {
    let result;

    if (contentSid) {
      console.log('Mode: Template Message (contentSid)');
      result = await whatsappService.sendTemplateMessage(to, contentSid, contentVariables);
    } else {
      console.log('Mode: Plain Text Message');
      result = await whatsappService.sendMessage(
        to,
        'Hello from AgriLink! Test message from testSMSService.js'
      );
    }

    console.log('✅ Message request accepted by Twilio');
    console.log('SID:', result.sid);
    console.log('Status:', result.status);
    console.log('From:', result.from);
    console.log('To:', result.to);
    console.log('\nIf status is queued/sent, delivery is in progress. Check Twilio Console logs for final delivery state.');
  } catch (error) {
    console.error('❌ Message send failed');
    console.error('Reason:', error.message);

    if (error.message.includes('63015')) {
      console.error('Tip: Join Twilio WhatsApp sandbox from recipient WhatsApp first.');
    }
    if (error.message.includes('contentSid')) {
      console.error('Tip: Set TWILIO_WHATSAPP_CONTENT_SID in .env or clear it to send plain text.');
    }

    process.exitCode = 1;
  }
}

testSMSService();
