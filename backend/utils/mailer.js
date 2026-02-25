import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function getFromAddress() {
  return process.env.EMAIL_FROM || `no-reply@${process.env.SMTP_HOST}`;
}

async function sendMail({ to, subject, text, html }) {
  try {
    const mailer = getTransporter();
    const info = await mailer.sendMail({ from: getFromAddress(), to, subject, text, html });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
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
