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
const createTransporter = (useSSL = false) => {
  return nodemailer.createTransport({
    host: "smtp.titan.email",
    port: useSSL ? 465 : 587,
    secure: useSSL, // true for SSL (465), false for STARTTLS (587)
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
    // Increased timeouts for Vercel serverless environment
    connectionTimeout: 30000, // 30 seconds for initial connection
    greetingTimeout: 30000, // 30 seconds for SMTP greeting
    socketTimeout: 60000, // 60 seconds for socket operations
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000,
    },
  });
};

/**
 * Send email with retry logic for serverless environments
 * Tries port 587 (STARTTLS) first, then falls back to port 465 (SSL) if it fails
 */
const sendMailWithRetry = async (mailOptions, retries = 3) => {
  let lastError;
  let currentTransporter = null;
  let triedSSL = false;
  
  // First, try with port 587 (STARTTLS)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create fresh transporter for each attempt (important for serverless)
      currentTransporter = createTransporter(false); // Try STARTTLS first
      
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
      const errorMessage = error.message || '';
      const errorCode = error.code || '';
      
      console.warn(`Email send attempt ${attempt}/${retries} (port 587) failed:`, errorMessage, `(code: ${errorCode || 'none'})`);
      
      // Clean up transporter on error
      if (currentTransporter) {
        try {
          currentTransporter.close();
        } catch (closeError) {
          // Ignore close errors
        }
        currentTransporter = null;
      }
      
      // Check if it's a retryable error (connection/timeout errors)
      const isRetryable = 
        errorCode === 'ECONNECTION' || 
        errorCode === 'ETIMEDOUT' || 
        errorCode === 'ESOCKET' ||
        errorCode === 'ETIMEOUT' ||
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('connection');
      
      // If it's a retryable error and we have retries left, wait and retry
      if (attempt < retries && isRetryable) {
        const delay = 2000 * attempt; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying port 587 in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If all retries failed on port 587, break to try port 465
      break;
    }
  }
  
  // If port 587 failed, try port 465 (SSL) as fallback
  if (lastError && (lastError.code === 'ECONNECTION' || 
      lastError.code === 'ETIMEDOUT' || 
      lastError.code === 'ESOCKET' ||
      lastError.message?.toLowerCase().includes('timeout'))) {
    console.log("Port 587 failed, trying port 465 (SSL) as fallback...");
    triedSSL = true;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Try with SSL (port 465)
        currentTransporter = createTransporter(true);
        
        const result = await currentTransporter.sendMail(mailOptions);
        
        // Close connection after sending
        try {
          currentTransporter.close();
        } catch (closeError) {
          console.warn("Error closing transporter:", closeError.message);
        }
        
        console.log("✅ Email sent successfully using port 465 (SSL)");
        return result;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        
        console.warn(`Email send attempt ${attempt}/${retries} (port 465) failed:`, errorMessage, `(code: ${errorCode || 'none'})`);
        
        // Clean up transporter on error
        if (currentTransporter) {
          try {
            currentTransporter.close();
          } catch (closeError) {
            // Ignore close errors
          }
          currentTransporter = null;
        }
        
        // If it's a retryable error and we have retries left, wait and retry
        if (attempt < retries) {
          const delay = 2000 * attempt;
          console.log(`Retrying port 465 in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
  }
  
  // If both ports failed, throw the last error
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
