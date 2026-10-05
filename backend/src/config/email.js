import nodemailer from 'nodemailer';
import { env } from './env.js';

let mailTransporter = null;

const isSmtpConfigured = env.SMTP_HOST && !env.SMTP_HOST.includes('placeholder') && env.SMTP_USER && !env.SMTP_USER.includes('placeholder');

if (isSmtpConfigured) {
  mailTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
  });
  console.log('[Email] Nodemailer configured with SMTP server:', env.SMTP_HOST);
} else {
  // Mock transporter for development/testing
  mailTransporter = {
    sendMail: async (options) => {
      console.log(`[Email Simulation] To: ${options.to} | Subject: ${options.subject}`);
      return { messageId: `mock-email-${Date.now()}` };
    }
  };
  console.log('[Email] SMTP credentials not set; running email in simulation mode');
}

export { mailTransporter, isSmtpConfigured };
