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
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Call Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">✅ Call Confirmed!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 500;">Hello ${name},</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">Your consultation call has been confirmed. We're excited to discuss your project with you!</p>
              
              <!-- Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 5px;">Date</td>
                      </tr>
                      <tr>
                        <td style="color: #333333; font-size: 16px; padding-bottom: 15px;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 10px; padding-bottom: 5px;">Time</td>
                      </tr>
                      <tr>
                        <td style="color: #333333; font-size: 16px; padding-bottom: 15px;">${time}</td>
                      </tr>
                      <tr>
                        <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 10px; padding-bottom: 5px;">Project Type</td>
                      </tr>
                      <tr>
                        <td style="color: #333333; font-size: 16px; padding-bottom: 15px;">${projectType}</td>
                      </tr>
                      <tr>
                        <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 10px; padding-bottom: 5px;">Budget</td>
                      </tr>
                      <tr>
                        <td style="color: #333333; font-size: 16px;">${budget}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">We look forward to speaking with you soon. If you have any questions or need to reschedule, please don't hesitate to reach out.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Best regards,</p>
              <p style="margin: 0; color: #667eea; font-size: 16px; font-weight: 600;">Arutis Technologies</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Schedule Call</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">📞 New Schedule Call Request</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">You have received a new consultation call request. Here are the details:</p>
              
              <!-- Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Name</td>
                              <td style="color: #333333; font-size: 16px;">${name}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Email</td>
                              <td style="color: #333333; font-size: 16px;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Date</td>
                              <td style="color: #333333; font-size: 16px;">${formattedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Time</td>
                              <td style="color: #333333; font-size: 16px;">${time}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Project Type</td>
                              <td style="color: #333333; font-size: 16px;">${projectType}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Budget</td>
                              <td style="color: #333333; font-size: 16px;">${budget}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #666666; font-size: 14px;">Arutis Technologies</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">✅ Message Received!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 500;">Hello ${name},</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">Thank you for reaching out to us! We have successfully received your message and our team will get back to you shortly.</p>
              
              <!-- Message Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
                    <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 16px; line-height: 1.6;">We appreciate your interest in Arutis Technologies and look forward to assisting you with your needs.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Best regards,</p>
              <p style="margin: 0; color: #667eea; font-size: 16px; font-weight: 600;">Arutis Technologies</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">📬 New Contact Message</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">You have received a new contact form submission. Here are the details:</p>
              
              <!-- Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Name</td>
                              <td style="color: #333333; font-size: 16px;">${name}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Email</td>
                              <td style="color: #333333; font-size: 16px;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Phone</td>
                              <td style="color: #333333; font-size: 16px;"><a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; width: 150px;">Company</td>
                              <td style="color: #333333; font-size: 16px;">${company || "N/A"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                    <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #666666; font-size: 14px;">Arutis Technologies</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
