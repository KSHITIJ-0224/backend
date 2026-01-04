import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

/**
 * =====================================================
 * BIGROCK / TITAN SMTP CONFIG
 * =====================================================
 */
const COMPANY_EMAIL = process.env.BIGROCK_EMAIL;
const COMPANY_PASSWORD = process.env.BIGROCK_PASSWORD;

if (!COMPANY_EMAIL || !COMPANY_PASSWORD) {
  throw new Error("❌ BIGROCK_EMAIL or BIGROCK_PASSWORD missing in .env");
}

/**
 * Create transporter function - creates a new connection for each use
 * This is important for serverless environments like Vercel where
 * connections can be closed between function invocations
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: COMPANY_EMAIL,
      pass: COMPANY_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Serverless-friendly settings
    pool: false, // Disable connection pooling for serverless
    maxConnections: 1,
    maxMessages: 1,
    connectionTimeout: 10000, // Reduced timeout for faster failures
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000,
    },
  });
};

/**
 * Send email with retry logic for serverless environments
 */
const sendMailWithRetry = async (mailOptions, retries = 3) => {
  let lastError;
  let currentTransporter = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create fresh transporter for each attempt (important for serverless)
      currentTransporter = createTransporter();
      
      const result = await currentTransporter.sendMail(mailOptions);
      
      // Close connection after sending (with error handling)
      try {
        currentTransporter.close();
      } catch (closeError) {
        console.warn("Error closing transporter:", closeError.message);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Email send attempt ${attempt}/${retries} failed:`, error.message);
      
      // Clean up transporter on error
      if (currentTransporter) {
        try {
          currentTransporter.close();
        } catch (closeError) {
          // Ignore close errors
        }
        currentTransporter = null;
      }
      
      // If it's a connection error and we have retries left, wait and retry
      if (attempt < retries && (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      // If it's not a connection error or we're out of retries, throw
      throw error;
    }
  }
  
  throw lastError;
};

/**
 * =====================================================
 * SCHEDULE CALL EMAILS
 * =====================================================
 */
export const sendScheduleCallEmails = async (payload) => {
  try {
    const { name, email, date, time, projectType, budget } = payload;

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // USER EMAIL
    const userMail = {
      from: `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: email,
      replyTo: COMPANY_EMAIL,
      subject: "✅ Your Call is Confirmed - Arutis Technologies",
      html: `<h2>Hello ${name},</h2>
        <p>Your consultation call has been confirmed.</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <br/>
        <p>Regards,<br/>Arutis Technologies</p>`,
      text: `Hello ${name},
Your consultation call has been confirmed.

Date: ${formattedDate}
Time: ${time}
Project Type: ${projectType}
Budget: ${budget}

Regards,
Arutis Technologies`,
    };

    // ADMIN EMAIL
    const adminMail = {
      from: `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: COMPANY_EMAIL,
      subject: `📞 New Schedule Call from ${name}`,
      html: `<h2>New Schedule Call Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget:</strong> ${budget}</p>`,
      text: `New Schedule Call Request

Name: ${name}
Email: ${email}
Date: ${formattedDate}
Time: ${time}
Project Type: ${projectType}
Budget: ${budget}`,
    };

    console.log("\n📧 ======== SCHEDULE CALL EMAIL ========");
    console.log(`📧 From: ${COMPANY_EMAIL} (BigRock Titan)`);
    console.log(`📧 To Customer: ${email}`);

    const userResult = await sendMailWithRetry(userMail);
    const adminResult = await sendMailWithRetry(adminMail);

    console.log("✅ User email sent:", userResult.messageId);
    console.log("✅ Admin email sent:", adminResult.messageId);

    return {
      success: true,
      userEmailId: userResult.messageId,
      adminEmailId: adminResult.messageId,
    };
  } catch (error) {
    console.error("❌ Schedule Call Email Error:", error.message);
    throw error;
  }
};

/**
 * =====================================================
 * CONTACT FORM EMAILS
 * =====================================================
 */
export const sendContactEmails = async (payload) => {
  try {
    const { name, email, phone, company, message } = payload;

    // USER EMAIL
    const userMail = {
      from: `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: email,
      replyTo: COMPANY_EMAIL,
      subject: "✅ We Received Your Message - Arutis Technologies",
      html: `<h2>Hello ${name},</h2>
        <p>We have received your message.</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>We'll get back to you shortly.</p>
        <p>Regards,<br/>Arutis Technologies</p>`,
      text: `Hello ${name},

We have received your message.

Message:
${message}

We'll get back to you shortly.

Regards,
Arutis Technologies`,
    };

    // ADMIN EMAIL
    const adminMail = {
      from: `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: COMPANY_EMAIL,
      subject: `📬 New Contact Message from ${name}`,
      html: `<h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>`,
      text: `New Contact Message

Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || "N/A"}

Message:
${message}`,
    };

    console.log("\n📧 ======== CONTACT EMAIL ========");
    console.log(`📧 From: ${COMPANY_EMAIL} (BigRock Titan)`);
    console.log(`📧 To Customer: ${email}`);

    const userResult = await sendMailWithRetry(userMail);
    const adminResult = await sendMailWithRetry(adminMail);

    console.log("✅ User email sent:", userResult.messageId);
    console.log("✅ Admin email sent:", adminResult.messageId);

    return {
      success: true,
      userEmailId: userResult.messageId,
      adminEmailId: adminResult.messageId,
    };
  } catch (error) {
    console.error("❌ Contact Email Error:", error.message);
    throw error;
  }
};
