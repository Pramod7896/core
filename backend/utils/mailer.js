import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * ---------------------------------------------------
 * SMTP TRANSPORTER
 * ---------------------------------------------------
 */
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // 465
  secure: true, // MUST be true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


/**
 * ---------------------------------------------------
 * OPTIONAL: VERIFY SMTP AT STARTUP (NON-BLOCKING)
 * ---------------------------------------------------
 */
transporter.verify((err) => {
  if (err) {
    console.error("⚠️ SMTP Connection Failed (non-blocking):", err.message);
  } else {
    console.log("📩 SMTP Connected Successfully");
  }
});

const COMPANY_NAME = process.env.COMPANY_NAME || "Technology";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@example.com";

/**
 * ---------------------------------------------------
 * SEND OTP EMAIL (NON-BLOCKING)
 * ---------------------------------------------------
 */
export async function sendOTPEmail(to, otp, username) {
  try {
    await transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to,
      subject: `${COMPANY_NAME} - Password Reset Verification`,
      text: `
Hi ${username},

We received a request to reset the password for your account.
Use the OTP below to proceed:

OTP: ${otp}
Expires in: 10 minutes

If you did not request this password reset, contact support immediately at ${SUPPORT_EMAIL}.
This is an automated message from a no-reply email. Do not reply.

Thank you,
${COMPANY_NAME} Support Team
      `,
      html: `
        <p>Hi <b>${username}</b>,</p>

        <p>We received a request to reset your account password.</p>
        <p>Use the OTP below to continue:</p>

        <h2 style="letter-spacing:2px;">${otp}</h2>
        <p><b>Expires in:</b> 10 minutes</p>

        <p>
          If you did not request this, contact
          <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
        </p>

        <p style="font-size:12px;">
          This is an automated message. Do not reply.
        </p>

        <p>
          Thank you,<br/>
          <b>${COMPANY_NAME} Support Team</b>
        </p>
      `,
    });
  } catch (err) {
    // 🔒 DO NOT THROW — EMAIL IS NON-CRITICAL
    console.error("⚠️ sendOTPEmail failed (non-blocking):", err.message);
  }
}
