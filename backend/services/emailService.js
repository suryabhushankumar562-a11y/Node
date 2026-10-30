const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#8b5e34;">Welcome to Luxe Spa & Wellness, ${name}!</h2>
      <p>Thank you for joining us. Explore our curated spa services and book your first appointment today.</p>
    </div>`,
  bookingConfirmation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#8b5e34;">Booking Confirmed</h2>
      <p>Your booking <strong>${booking.bookingCode}</strong> is confirmed for
      ${new Date(booking.date).toDateString()} at ${booking.startTime}.</p>
      <p>Total Amount: ₹${booking.priceDetails.totalAmount}</p>
    </div>`,
  paymentSuccess: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#2e7d32;">Payment Successful</h2>
      <p>We've received your payment of ₹${booking.priceDetails.totalAmount} for booking
      ${booking.bookingCode}.</p>
    </div>`,
  cancellation: (booking) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#c62828;">Booking Cancelled</h2>
      <p>Your booking <strong>${booking.bookingCode}</strong> has been cancelled.</p>
    </div>`,
  membershipExpiry: (name, plan) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#8b5e34;">Membership Expiring Soon</h2>
      <p>Hi ${name}, your ${plan} membership is expiring soon. Renew now to keep enjoying exclusive benefits.</p>
    </div>`,
  passwordReset: (resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#8b5e34;">Password Reset Request</h2>
      <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>`,
};

module.exports = { sendEmail, emailTemplates };
