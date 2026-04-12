import dotenv from "dotenv";
import { BrevoClient } from "@getbrevo/brevo";
import fetch from "node-fetch";

dotenv.config();

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

async function testBrevoEmail() {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "no-reply@example.com";
  const fromName = process.env.EMAIL_FROM_NAME || "AgriLink";
  const toEmail = "aenuine@gmail.com";

  console.log("==========================================");
  console.log("Brevo API Email Test");
  console.log("==========================================");
  console.log("To:", toEmail);
  console.log("From:", `${fromName} <${fromEmail}>`);

  if (!apiKey) {
    console.error("BREVO_API_KEY is missing in .env");
    process.exit(1);
  }

  const client = new BrevoClient({ apiKey });

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        email: fromEmail,
        name: fromName,
      },
      to: [{ email: toEmail }],
      subject: "AgriLink Brevo API test email",
      textContent: "This is a Brevo API test email from AgriLink backend.",
      htmlContent: `
        <p>Hello,</p>
        <p>This is a <strong>Brevo API</strong> test email from AgriLink backend.</p>
        <p>If you received this, Brevo API sending is working.</p>
        <p>- AgriLink</p>
      `,
    });

    console.log("Email sent successfully via Brevo API.");
    console.log("Message ID:", response?.messageId || "N/A");
    process.exit(0);
  } catch (error) {
    console.error("Brevo send failed:", error.message);
    if (error.body) {
      console.error("Brevo error details:", JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

testBrevoEmail();
