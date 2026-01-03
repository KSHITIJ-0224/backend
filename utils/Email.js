import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtpout.secureserver.net",
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASSWORD?.trim(),
  },
});

// Debug: Log configuration
if (process.env.EMAIL_USER) {
  console.log(`✅ Email configured: ${process.env.EMAIL_USER}`);
  console.log(`📧 SMTP Host: ${process.env.EMAIL_HOST || "smtp.titan.com"}`);
  console.log(`📧 SMTP Port: ${process.env.EMAIL_PORT || 465}`);
  console.log(`📧 Password: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);
} else {
  console.warn("⚠️ Warning: EMAIL_USER not found in .env file - emails won't be sent");
}

export const sendScheduleCallEmails = async (payload) => {
  try {
    const { name, email, date, time, projectType, budget } = payload;

    const userMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your call is scheduled - Arutis Technologies",
      text: `Hi ${name},

Your call has been scheduled.

Date: ${new Date(date).toDateString()}
Time: ${time}
Project type: ${projectType}
Budget: ${budget}

We'll contact you at this time. 

– Arutis Technologies`,
    };

    const adminMail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New call scheduled: ${name}`,
      text: `New schedule-call request:

Name: ${name}
Email: ${email}
Date: ${new Date(date).toDateString()}
Time: ${time}
Project type: ${projectType}
Budget: ${budget}
`,
    };

    await transporter.sendMail(userMail);
    console.log(`✅ Confirmation email sent to ${email}`);
    
    await transporter.sendMail(adminMail);
    console.log(`✅ Admin notification sent`);
  } catch (error) {
    console.error("❌ Email error:", error.message);
    // Don't throw - let the appointment be saved even if email fails
    // In production, you might want to log this to a service
  }
};

export const sendContactEmails = async (payload) => {
  try {
    const { name, email, phone, company, message } = payload;

    const userMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your message - Arutis Technologies",
      text: `Hi ${name},

Thank you for reaching out to us! We received your message and will get back to you shortly.

Company: ${company}
Phone: ${phone}
Message: ${message}

Best regards,
– Arutis Technologies Team`,
    };

    const adminMail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New contact form submission from ${name}`,
      text: `New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}
Message: ${message}
`,
    };

    await transporter.sendMail(userMail);
    console.log(`✅ Confirmation email sent to ${email}`);
    
    await transporter.sendMail(adminMail);
    console.log(`✅ Admin notification sent`);
  } catch (error) {
    console.error("❌ Email error:", error.message);
    // Don't throw - let the form be saved even if email fails
  }
};
