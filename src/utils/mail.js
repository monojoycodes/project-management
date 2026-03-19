import Mailgen from "mailgen";
import nodemailer from "nodemailer";

// Configure the mail generator
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Your App Name",
    link: process.env.FRONTEND_URL || "http://localhost:3000"
  }
});

// Configure the nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer transporter error:", error);
  } else {
    console.log("Nodemailer transporter ready");
  }
});

// Main send email function
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const emailVerificationTemplate = (username, verifyUrl) => {
  return mailGenerator.generate({
    body: {
      name: username,
      intro: "Welcome! Please verify your email address.",
      action: {
        instructions: "Click the button below to verify your account:",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: verifyUrl
        }
      },
      outro: "If you didn’t create this account, just ignore this email."
    }
  });
};

export const resetPasswordTemplate = (username, resetUrl) => {
  return mailGenerator.generate({
    body: {
      name: username,
      intro: "You requested a password reset.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset Password",
          link: resetUrl
        }
      },
      outro: "If you didn't request this, your account is safe."
    }
  });
};