import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.titan.email",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // Use TLS (false for 587, true for 465)
  requireTLS: true,
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

    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const userMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ Your Call is Confirmed! - Arutis Technologies",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 30px; }
            .confirmation-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .detail-item { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; }
            .detail-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
            .detail-value { font-size: 18px; color: #333; font-weight: 600; }
            .info-text { color: #666; font-size: 15px; line-height: 1.6; margin: 20px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
            .footer-text { color: #999; font-size: 13px; margin: 10px 0; }
            .footer-link { color: #667eea; text-decoration: none; }
            .divider { border-bottom: 1px solid #e0e0e0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Call Scheduled!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We're excited to connect with you</p>
            </div>

            <div class="content">
              <div class="greeting">
                Hi <strong>${name}</strong>,
              </div>

              <div class="confirmation-box">
                <strong style="color: #667eea; font-size: 16px;">✓ Your consultation call has been confirmed!</strong>
                <p style="margin: 12px 0 0 0; color: #666; font-size: 14px;">We've received your request and locked in the time slot.</p>
              </div>

              <div style="margin: 25px 0;">
                <p style="color: #333; font-size: 14px; font-weight: 600; margin-bottom: 15px;">📋 Call Details:</p>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">📅 Date</div>
                    <div class="detail-value">${formattedDate}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">⏰ Time</div>
                    <div class="detail-value">${time}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">🎯 Project Type</div>
                    <div class="detail-value" style="text-transform: capitalize;">${projectType}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">💰 Budget</div>
                    <div class="detail-value" style="text-transform: capitalize;">${budget}</div>
                  </div>
                </div>
              </div>

              <div class="info-text">
                <strong>What to expect:</strong>
                <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
                  <li>We'll call you on the scheduled date and time</li>
                  <li>Our team will discuss your project requirements in detail</li>
                  <li>We'll provide expert recommendations tailored to your needs</li>
                  <li>You'll get a customized proposal after the call</li>
                </ul>
              </div>

              <div class="divider"></div>

              <div class="info-text">
                <strong>Got any questions?</strong>
                <p>Feel free to reply to this email or reach out to our team. We're here to help!</p>
              </div>

              <center>
                <a href="https://arutis-project.vercel.app" class="cta-button">Visit Our Website</a>
              </center>
            </div>

            <div class="footer">
              <p style="margin: 0; color: #333; font-weight: 600;">Arutis Technologies</p>
              <p class="footer-text">Transforming ideas into digital solutions</p>
              <p class="footer-text">
                <a href="https://arutis-project.vercel.app" class="footer-link">www.arutis-project.vercel.app</a> | 
                <a href="mailto:info@arutistechnologies.com" class="footer-link">info@arutistechnologies.com</a>
              </p>
              <p class="footer-text">© 2026 Arutis Technologies. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const adminMail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📞 New Schedule Call Request from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
            .content { padding: 30px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
            .details-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .details-table .label { font-weight: 600; color: #333; width: 35%; }
            .details-table .value { color: #666; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📞 New Call Scheduled</h1>
            </div>

            <div class="content">
              <div class="alert-box">
                <strong>✅ A new schedule call request has been submitted!</strong>
              </div>

              <h3 style="color: #333; margin-top: 30px;">Client Information:</h3>
              <table class="details-table">
                <tr>
                  <td class="label">👤 Name:</td>
                  <td class="value"><strong>${name}</strong></td>
                </tr>
                <tr>
                  <td class="label">📧 Email:</td>
                  <td class="value"><a href="mailto:${email}">${email}</a></td>
                </tr>
              </table>

              <h3 style="color: #333; margin-top: 30px;">Call Details:</h3>
              <table class="details-table">
                <tr>
                  <td class="label">📅 Date:</td>
                  <td class="value"><strong>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                </tr>
                <tr>
                  <td class="label">⏰ Time:</td>
                  <td class="value"><strong>${time}</strong></td>
                </tr>
                <tr>
                  <td class="label">🎯 Project Type:</td>
                  <td class="value" style="text-transform: capitalize;"><strong>${projectType}</strong></td>
                </tr>
                <tr>
                  <td class="label">💰 Budget Range:</td>
                  <td class="value" style="text-transform: capitalize;"><strong>${budget}</strong></td>
                </tr>
              </table>

              <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #667eea; font-weight: 600;">⚡ Action Required:</p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Make sure to contact the client on the scheduled date and time.</p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">Arutis Technologies | Admin Notification</p>
            </div>
          </div>
        </body>
        </html>
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
      subject: "✅ We've Received Your Message - Arutis Technologies",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 30px; }
            .confirmation-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px; }
            .info-text { color: #666; font-size: 15px; line-height: 1.8; margin: 20px 0; }
            .message-box { background: #f9f9f9; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .message-label { color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
            .message-content { color: #333; font-size: 15px; line-height: 1.6; }
            .detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .detail-item { background: #f9f9f9; padding: 15px; border-radius: 8px; }
            .detail-label { color: #999; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; }
            .detail-value { color: #333; font-size: 14px; font-weight: 600; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
            .footer-text { color: #999; font-size: 13px; margin: 10px 0; }
            .footer-link { color: #667eea; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for reaching out</p>
            </div>

            <div class="content">
              <div class="greeting">
                Hi <strong>${name}</strong>,
              </div>

              <div class="confirmation-box">
                <strong style="color: #667eea; font-size: 16px;">✓ We've received your message!</strong>
                <p style="margin: 12px 0 0 0; color: #666; font-size: 14px;">Our team will review your inquiry and get back to you within 24 hours.</p>
              </div>

              <div class="info-text">
                We really appreciate you taking the time to contact us. Your message is important to us, and we're committed to providing you with the best possible response.
              </div>

              <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">📋 Your Message Details:</h3>
              <div class="detail-row">
                <div class="detail-item">
                  <div class="detail-label">📞 Phone</div>
                  <div class="detail-value">${phone}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">🏢 Company</div>
                  <div class="detail-value">${company || 'Not specified'}</div>
                </div>
              </div>

              <div class="message-box">
                <div class="message-label">💬 Your Message:</div>
                <div class="message-content">${message}</div>
              </div>

              <div class="info-text">
                <strong>What happens next?</strong>
                <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
                  <li>Our team will carefully review your inquiry</li>
                  <li>We'll analyze your requirements and expertise needed</li>
                  <li>You'll receive a detailed response from our experts</li>
                  <li>We'll suggest the best solutions for your needs</li>
                </ul>
              </div>

              <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                <p style="margin: 0; color: #333; font-weight: 600;">Have urgent questions?</p>
                <p style="color: #666; margin: 8px 0 0 0;">Feel free to call us directly or reply to this email.</p>
              </div>

              <center>
                <a href="https://arutis-project.vercel.app" class="cta-button">Visit Our Website</a>
              </center>
            </div>

            <div class="footer">
              <p style="margin: 0; color: #333; font-weight: 600;">Arutis Technologies</p>
              <p class="footer-text">Transforming ideas into digital solutions</p>
              <p class="footer-text">
                <a href="https://arutis-project.vercel.app" class="footer-link">www.arutis-project.vercel.app</a> | 
                <a href="mailto:info@arutistechnologies.com" class="footer-link">info@arutistechnologies.com</a>
              </p>
              <p class="footer-text">© 2026 Arutis Technologies. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const adminMail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📬 New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
            .content { padding: 30px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
            .details-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .details-table .label { font-weight: 600; color: #333; width: 35%; }
            .details-table .value { color: #666; }
            .message-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .message-label { font-weight: 600; color: #333; margin-bottom: 10px; }
            .message-content { color: #666; line-height: 1.6; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Contact Form Submission</h1>
            </div>

            <div class="content">
              <div class="alert-box">
                <strong>✅ A new contact message has been submitted!</strong>
              </div>

              <h3 style="color: #333; margin-top: 30px;">Contact Information:</h3>
              <table class="details-table">
                <tr>
                  <td class="label">👤 Name:</td>
                  <td class="value"><strong>${name}</strong></td>
                </tr>
                <tr>
                  <td class="label">📧 Email:</td>
                  <td class="value"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td class="label">📞 Phone:</td>
                  <td class="value"><a href="tel:${phone}">${phone}</a></td>
                </tr>
                <tr>
                  <td class="label">🏢 Company:</td>
                  <td class="value">${company || 'Not specified'}</td>
                </tr>
              </table>

              <div class="message-box">
                <div class="message-label">💬 Message:</div>
                <div class="message-content">${message}</div>
              </div>

              <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #667eea; font-weight: 600;">⚡ Action Required:</p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Please respond to this inquiry within 24 hours to maintain excellent customer service.</p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">Arutis Technologies | Admin Notification</p>
            </div>
          </div>
        </body>
        </html>
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
