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

const transporter = nodemailer.createTransport({
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
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ BigRock SMTP verification failed:", error.message);
  } else {
    console.log("✅ BigRock SMTP verified and ready");
  }
});

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

    const userResult = await transporter.sendMail(userMail);
    const adminResult = await transporter.sendMail(adminMail);

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
        <p>We’ll get back to you shortly.</p>
        <p>Regards,<br/>Arutis Technologies</p>`,
      text: `Hello ${name},

We have received your message.

Message:
${message}

We’ll get back to you shortly.

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

    const userResult = await transporter.sendMail(userMail);
    const adminResult = await transporter.sendMail(adminMail);

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
