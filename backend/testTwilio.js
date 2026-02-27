import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Test Twilio SMS functionality
 * Replace the 'to' number with your actual phone number to receive the test SMS
 */
async function testTwilioSMS() {
  try {
    console.log('Testing Twilio SMS...');
    console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log('From Number:', process.env.TWILIO_PHONE_NUMBER);
    
    // Send test SMS
    const message = await client.messages.create({
      body: 'Hello from AgriLink! This is a test SMS to verify Twilio integration.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+94710505707' // Replace with your actual phone number (E.164 format: +[country code][number])
    });

    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('To:', message.to);
    console.log('From:', message.from);
    
  } catch (error) {
    console.error('❌ Error sending SMS:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    // Common error codes
    if (error.code === 21211) {
      console.error('\n⚠️  Invalid phone number format. Use E.164 format: +[country code][number]');
    } else if (error.code === 21608) {
      console.error('\n⚠️  The phone number is not verified. Add it to your Twilio verified numbers.');
    } else if (error.code === 20003) {
      console.error('\n⚠️  Authentication failed. Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    }
  }
}

// Run the test
testTwilioSMS();
