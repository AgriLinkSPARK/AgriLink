import fetch from "node-fetch";
import { BrevoClient } from "@getbrevo/brevo";

// Polyfill fetch for Node.js v16
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

let brevoClient = null;

function getBrevoClient() {
  if (!brevoClient) {
    brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });
  }
  return brevoClient;
}

function getFromAddress() {
  return {
    email: process.env.EMAIL_FROM || "no-reply@example.com",
    name: process.env.EMAIL_FROM_NAME || "AgriLink"
  };
}

// Basic email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function sendMail({ to, subject, text, html }) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    // Validate email format
    if (!to || !isValidEmail(to)) {
      throw new Error(`Invalid email address: ${to}`);
    }

    const client = getBrevoClient();
    const fromAddress = getFromAddress();
    
    console.log(`📧 Attempting to send email to: ${to}`);
    
    const emailData = {
      sender: fromAddress,
      to: [{ email: to }],
      subject: subject,
      textContent: text,
      htmlContent: html,
    };

    const info = await client.transactionalEmails.sendTransacEmail(emailData);
    console.log("✅ Email sent successfully:", info.messageId);
    console.log("📨 Response:", info);
    return info;
  } catch (err) {
    console.error("❌ Error sending email to:", to);
    console.error("❌ Error message:", err.message);
    if (err.body) {
      console.error("❌ Brevo error details:", err.body);
    }
    throw err;
  }
}

export async function sendWelcomeEmail(to, name) {
  const subject = "Welcome to AgriLink";
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>Welcome to AgriLink! We're excited to have you as a buyer. You can now browse products, place orders, and support local farmers.</p>
    <p>If you ever need help, reply to this email.</p>
    <p>— The AgriLink Team</p>
  `;
  const text = `Hi ${name || "there"},\n\nWelcome to AgriLink! We're excited to have you as a buyer.\n\n— The AgriLink Team`;
  return sendMail({ to, subject, text, html });
}

export async function sendPasswordChangedEmail(to, name) {
  const subject = "Your AgriLink password was changed";
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>This is a confirmation that your account password was successfully updated. If you did not perform this change, please contact support immediately or reset your password.</p>
    <p>— The AgriLink Team</p>
  `;
  const text = `Hi ${name || "there"},\n\nThis is a confirmation that your account password was successfully updated. If you did not perform this change, please contact support immediately or reset your password.\n\n— The AgriLink Team`;
  return sendMail({ to, subject, text, html });
}

export default { sendWelcomeEmail, sendPasswordChangedEmail };
