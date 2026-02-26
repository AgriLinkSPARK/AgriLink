import Mailgun from "mailgun.js";
import formData from "form-data";

let mailgunClient = null;

function getMailgunClient() {
  if (!mailgunClient) {
    const mailgun = new Mailgun(formData);
    mailgunClient = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
      url: process.env.MAILGUN_HOST,
    });
  }
  return mailgunClient;
}

function getFromAddress() {
  return process.env.EMAIL_FROM || "no-reply@example.com";
}

function getMailgunDomain() {
  return process.env.MAILGUN_DOMAIN || "";
}

async function sendMail({ to, subject, text, html }) {
  try {
    const domain = getMailgunDomain();
    if (!domain) {
      throw new Error("MAILGUN_DOMAIN is not configured");
    }

    const client = getMailgunClient();
    console.log(`📧 Attempting to send email to: ${to}`);
    const info = await client.messages.create(domain, {
      from: getFromAddress(),
      to: [to],
      subject,
      text,
      html,
    });
    console.log("✅ Email sent successfully:", info.id);
    console.log("📨 Response:", info);
    return info;
  } catch (err) {
    console.error("❌ Error sending email to:", to);
    console.error("❌ Error message:", err.message);
    console.error("❌ Full error:", err);
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
