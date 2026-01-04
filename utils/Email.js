import { Resend } from "resend";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

/**
 * =====================================================
 * RESEND EMAIL API CONFIG
 * =====================================================
 * Resend is a modern email API built for serverless environments
 * No SMTP connection issues, no timeouts, much more reliable!
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const COMPANY_EMAIL = process.env.BIGROCK_EMAIL || process.env.FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY not found. Emails will not be sent.");
  console.warn("Get your API key from: https://resend.com/api-keys");
}

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send email using Resend API
 * This is much more reliable than SMTP in serverless environments
 */
const sendEmail = async (emailData) => {
  if (!resend) {
    throw new Error("Resend API key not configured. Please set RESEND_API_KEY in environment variables.");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailData.from || `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      reply_to: emailData.replyTo || COMPANY_EMAIL,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    return {
      messageId: data?.id || "unknown",
      success: true,
    };
  } catch (error) {
    console.error("Resend email error:", error.message);
    throw error;
  }
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
    const userEmailData = {
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
    const adminEmailData = {
      from: `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: ADMIN_EMAIL,
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
    console.log(`📧 From: ${COMPANY_EMAIL} (Resend API)`);
    console.log(`📧 To Customer: ${email}`);

    const userResult = await sendEmail(userEmailData);
    const adminResult = await sendEmail(adminEmailData);

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
    const userEmailData = {
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
    const adminEmailData = {
      from: `Arutis Technologies <${COMPANY_EMAIL}>`,
      to: ADMIN_EMAIL,
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
    console.log(`📧 From: ${COMPANY_EMAIL} (Resend API)`);
    console.log(`📧 To Customer: ${email}`);

    const userResult = await sendEmail(userEmailData);
    const adminResult = await sendEmail(adminEmailData);

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
