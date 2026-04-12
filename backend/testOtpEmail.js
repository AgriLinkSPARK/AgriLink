import dotenv from "dotenv";
import { sendLoginOTPEmail } from "./utils/mailer.js";

dotenv.config();

async function testOtpEmail() {
  const to = process.argv[2] || process.env.TEST_EMAIL || process.env.EMAIL_FROM;
  const name = process.argv[3] || "Test User";
  const otp = process.argv[4] || "123456";

  console.log("==========================================");
  console.log("OTP Email Test (Brevo)");
  console.log("==========================================");
  console.log("To:", to);
  console.log("From:", process.env.EMAIL_FROM);
  console.log("Sender Name:", process.env.EMAIL_FROM_NAME || "AgriLink");

  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing in .env");
    process.exit(1);
  }

  if (!to) {
    console.error("Recipient email is missing. Pass as first CLI arg or set TEST_EMAIL.");
    process.exit(1);
  }

  try {
    await sendLoginOTPEmail(to, name, otp);
    console.log("OTP email sent successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    if (error.body) {
      console.error("Provider response:", JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

testOtpEmail();
