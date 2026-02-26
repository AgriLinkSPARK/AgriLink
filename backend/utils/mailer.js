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

export async function sendFarmerWelcomeEmail(to, name, tempPassword = null) {
  const subject = "Welcome to AgriLink - Farmer Account";
  const passwordSection = tempPassword ? `<p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Please change this password after your first login.</p>` : "";
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>Welcome to AgriLink! We're excited to have you as a farmer partner. You can now manage your products, track orders, and connect with buyers.</p>
    ${passwordSection}
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>— The AgriLink Team</p>
  `;
  const text = `Hi ${name || "there"},\n\nWelcome to AgriLink! We're excited to have you as a farmer partner.\n\n${tempPassword ? `Your temporary password is: ${tempPassword}\nPlease change this password after your first login.\n\n` : ""}If you have any questions, feel free to reach out to our support team.\n\n— The AgriLink Team`;
  return sendMail({ to, subject, text, html });
}

export async function sendOrderConfirmationEmail(to, name, orderId, totalPrice) {
  const subject = `Order Confirmation - AgriLink Order #${orderId}`;
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>Thank you for your order! We've received your order and are processing it.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
    <p>You will receive a shipping notification once your order is dispatched.</p>
    <p>— The AgriLink Team</p>
  `;
  const text = `Hi ${name || "there"},\n\nThank you for your order!\n\nOrder ID: ${orderId}\nTotal Amount: ₹${totalPrice}\n\nYou will receive a shipping notification once your order is dispatched.\n\n— The AgriLink Team`;
  return sendMail({ to, subject, text, html });
}

export async function sendOrderCancellationEmail(to, name, orderId) {
  const subject = `Order Cancelled - AgriLink Order #${orderId}`;
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>Your order has been cancelled successfully.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p>If you have any questions about this cancellation, please contact our support team.</p>
    <p>— The AgriLink Team</p>
  `;
  const text = `Hi ${name || "there"},\n\nYour order has been cancelled successfully.\n\nOrder ID: ${orderId}\n\nIf you have any questions about this cancellation, please contact our support team.\n\n— The AgriLink Team`;
  return sendMail({ to, subject, text, html });
}

export async function sendPaymentConfirmationEmail(to, name, orderId, totalPrice) {
  const subject = `Payment Confirmed - AgriLink Order #${orderId}`;
  const html = `
    <p>Hi ${name || "there"},</p>
    <p>We've received your payment successfully!</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Amount Paid:</strong> ₹${totalPrice}</p>
    <p>Your order is now confirmed and will be prepared for shipment.</p>
    <p>— The AgriLink Team</p>
  `;
  const text = `Hi ${name || "there"},\n\nWe've received your payment successfully!\n\nOrder ID: ${orderId}\nAmount Paid: ₹${totalPrice}\n\nYour order is now confirmed and will be prepared for shipment.\n\n— The AgriLink Team`;
  return sendMail({ to, subject, text, html });
}

export default { 
  sendWelcomeEmail, 
  sendPasswordChangedEmail, 
  sendFarmerWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,
  sendPaymentConfirmationEmail
};
