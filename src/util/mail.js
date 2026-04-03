const nodemailer = require("nodemailer");
const logger = require("./logger");

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const DISABLE_EMAIL_SEND =
  String(process.env.DISABLE_EMAIL_SEND || "false").toLowerCase() === "true";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SENDER_EMAIL,
      pass: APP_PASSWORD,
    },
  });

  return transporter;
};

module.exports = () => {
  const sendMail = async (rec_mail, subject, text, html) => {
    if (DISABLE_EMAIL_SEND) {
      logger.info("Email sending disabled", { to: rec_mail, subject });
      return {
        messageId: `disabled-${Date.now()}`,
        accepted: [rec_mail],
        rejected: [],
        envelope: { from: SENDER_EMAIL || "", to: [rec_mail] },
      };
    }

    if (!SENDER_EMAIL || !APP_PASSWORD) {
      logger.error(
        "Email not configured: SENDER_EMAIL or APP_PASSWORD env var missing",
      );
      throw new Error("Email service not configured");
    }
    try {
      const mailOptions = {
        from: SENDER_EMAIL,
        to: rec_mail,
        subject: subject,
        text: text,
        html: html,
      };
      const info = await getTransporter().sendMail(mailOptions);
      logger.info("Mail sent", { to: rec_mail, messageId: info.messageId });
      return info;
    } catch (error) {
      logger.error("Failed to send email", {
        to: rec_mail,
        error: error.message,
      });
      throw error;
    }
  };
  return {
    sendMail,
  };
};
