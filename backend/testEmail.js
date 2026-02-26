import dotenv from "dotenv";
import { sendWelcomeEmail, sendPasswordChangedEmail } from "./utils/mailer.js";

// Load environment variables
dotenv.config();

async function testEmailSending() {
  console.log("==========================================");
  console.log("🧪 Email Sending Test");
  console.log("==========================================\n");

  // Check if Mailgun is configured
  if (!process.env.MAILGUN_API_KEY) {
    console.error("❌ MAILGUN_API_KEY not found in .env file");
    process.exit(1);
  }
  if (!process.env.MAILGUN_DOMAIN) {
    console.error("❌ MAILGUN_DOMAIN not found in .env file");
    process.exit(1);
  }

  console.log("✅ Mailgun API Key found");
  console.log(`🌐 Mailgun domain: ${process.env.MAILGUN_DOMAIN}`);
  console.log(`📧 From address: ${process.env.EMAIL_FROM}\n`);

  // Get test email from command line argument or use default
  const testEmail = process.argv[2] || "aenuine@gmail.com";
  const testName = process.argv[3] || "Test User";

  console.log(`📬 Test recipient: ${testEmail}`);
  console.log(`👤 Test name: ${testName}\n`);

  try {
    // Test 1: Send Welcome Email
    console.log("==========================================");
    console.log("Test 1: Sending Welcome Email...");
    console.log("==========================================");
    await sendWelcomeEmail(testEmail, testName);
    console.log("✅ Welcome email sent successfully!\n");

    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Send Password Changed Email
    console.log("==========================================");
    console.log("Test 2: Sending Password Changed Email...");
    console.log("==========================================");
    await sendPasswordChangedEmail(testEmail, testName);
    console.log("✅ Password changed email sent successfully!\n");

    console.log("==========================================");
    console.log("🎉 All email tests passed!");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n==========================================");
    console.error("❌ Email test failed!");
    console.error("==========================================");
    console.error("Error details:", error.message);
    if (error.details) {
      console.error("Mailgun response:", JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testEmailSending();
