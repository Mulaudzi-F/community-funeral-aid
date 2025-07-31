const nodemailer = require("nodemailer");
const twilio = require("twilio");
const User = require("../models/user");
const DeathReport = require("../models/deathReport");
const Section = require("../models/section");

// Email setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send email
exports.sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Community Funeral Aid" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending error:", error);
  }
};

// Send SMS
exports.sendSMS = async ({ to, body }) => {
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error("SMS sending error:", error);
  }
};

// Notify section members about new death report
exports.notifySectionMembers = async (sectionId, reportId) => {
  try {
    const section = await Section.findById(sectionId).populate("members");
    const report = await DeathReport.findById(reportId).populate("deceased");

    if (!section || !report) return;

    const message = `New death reported in ${section.name}: ${report.deceased.firstName} ${report.deceased.lastName}. Please review and vote within 24 hours.`;
    const link = `${process.env.FRONTEND_URL}/death-reports/${reportId}`;

    const notificationPromises = section.members.map((member) => {
      return Promise.all([
        this.sendEmail({
          to: member.email,
          subject: "New Death Report in Your Section",
          html: `
            <p>${message}</p>
            <p><a href="${link}">View Report</a></p>
            <p>Community Funeral Aid Team</p>
          `,
        }),
        this.sendSMS({
          to: member.phone,
          body: `${message} View report: ${link}`,
        }),
      ]);
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Section notification error:", error);
  }
};

// Send payment reminders
exports.sendPaymentReminders = async () => {
  try {
    // Find users with late payments
    const latePaymentDate = new Date();
    latePaymentDate.setMonth(latePaymentDate.getMonth() - 1);

    const lateUsers = await User.find({
      lastPaymentDate: { $lt: latePaymentDate },
      status: "active",
    });

    const reminderPromises = lateUsers.map((user) => {
      const message = `Your Community Funeral Aid contribution is overdue. Please make your payment to avoid account suspension.`;

      return Promise.all([
        this.sendEmail({
          to: user.email,
          subject: "Payment Reminder",
          html: `
            <p>${message}</p>
            <p><a href="${process.env.FRONTEND_URL}/make-payment">Make Payment Now</a></p>
          `,
        }),
        this.sendSMS({
          to: user.phone,
          body: message,
        }),
      ]);
    });

    await Promise.all(reminderPromises);
    console.log(`Sent ${lateUsers.length} payment reminders`);
  } catch (error) {
    console.error("Payment reminder error:", error);
  }
};

// Send death report status updates
exports.sendReportStatusUpdate = async (reportId, status, reason) => {
  try {
    const report = await DeathReport.findById(reportId)
      .populate("reporter")
      .populate("deceased");

    if (!report) return;

    let subject, message;

    if (status === "approved") {
      subject = "Death Report Approved";
      message = `Your death report for ${report.deceased.firstName} ${report.deceased.lastName} has been approved. The payout will be processed shortly.`;
    } else if (status === "rejected") {
      subject = "Death Report Rejected";
      message = `Your death report for ${report.deceased.firstName} ${
        report.deceased.lastName
      } has been rejected. Reason: ${reason || "Not specified"}`;
    } else if (status === "paid") {
      subject = "Payout Processed";
      message = `The payout for ${report.deceased.firstName} ${report.deceased.lastName} has been processed.`;
    }

    if (message) {
      await Promise.all([
        this.sendEmail({
          to: report.reporter.email,
          subject,
          html: `<p>${message}</p>`,
        }),
        this.sendSMS({
          to: report.reporter.phone,
          body: `${subject}: ${message}`,
        }),
      ]);
    }
  } catch (error) {
    console.error("Status update error:", error);
  }
};

exports.sendVerificationEmail = async (email, verificationUrl) => {
  const mailOptions = {
    from: `"Community Funeral Aid" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A2C82;">Email Verification</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4A2C82; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="font-size: 12px; color: #888;">This link will expire in 1 hour.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send payment confirmation
exports.sendPaymentConfirmation = async (userId, amount, reportId) => {
  const user = await User.findById(userId);
  const report = await DeathReport.findById(reportId).populate("deceased");

  await sendEmail({
    to: user.email,
    subject: "Contribution Payment Received",
    html: `
      <p>Thank you for your contribution of ZAR ${amount.toFixed(2)}</p>
      <p>This payment will help support the funeral costs for ${
        report.deceased.firstName
      } ${report.deceased.lastName}.</p>
      <p>Your account has been updated accordingly.</p>
    `,
  });

  await sendSMS({
    to: user.phone,
    body: `Payment of ZAR ${amount.toFixed(2)} received for ${
      report.deceased.firstName
    }'s funeral. Thank you.`,
  });
};
