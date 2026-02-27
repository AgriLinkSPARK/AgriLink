import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Test Dialog Ideamart SMS functionality
 */
async function testDialogSMS() {
  try {
    console.log('Testing Dialog Ideamart SMS...');
    console.log('API URL:', process.env.DIALOG_SMS_API_URL);
    
    const apiUrl = process.env.DIALOG_SMS_API_URL;
    const apiToken = process.env.DIALOG_API_TOKEN;

    if (!apiUrl || !apiToken) {
      throw new Error('Missing DIALOG_SMS_API_URL or DIALOG_API_TOKEN in .env');
    }
    
    const payload = {
      destination: '+94710505707',
      message: 'Hello from AgriLink! This is a test SMS via Dialog Ideamart.',
      sourceAddress: process.env.DIALOG_SOURCE_ADDRESS || 'AgriLink'
    };

    console.log('Sending SMS...');
    
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    console.log('✅ SMS sent successfully!');
    console.log('Response:', response.data);
    console.log('Status Code:', response.status);
    
  } catch (error) {
    console.error('❌ Error sending SMS:');
    
    if (error.response) {
      // Server responded with error
      console.error('Status Code:', error.response.status);
      console.error('Error Data:', error.response.data);
      
      // Common error handling
      if (error.response.status === 401) {
        console.error('\n⚠️  Authentication failed. Check your DIALOG_API_TOKEN');
      } else if (error.response.status === 400) {
        console.error('\n⚠️  Invalid request. Check payload format and API endpoint from Dialog Ideamart docs.');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from Dialog API');
      console.error('Check your internet connection and API endpoint');
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testDialogSMS();
