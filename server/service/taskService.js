const User = require("../models/user");
const DeathReport = require("../models/deathReport");
const Section = require("../models/section");
const { sendEmail, sendSMS } = require("./notificationService");

// Process late payments and suspend accounts
exports.processLatePayments = async () => {
  try {
    const latePaymentDate = new Date();
    latePaymentDate.setMonth(latePaymentDate.getMonth() - 2); // 2 months overdue

    // Find users with late payments
    const lateUsers = await User.find({
      lastPaymentDate: { $lt: latePaymentDate },
      status: "active",
    });

    // Add strikes or suspend accounts
    const updatePromises = lateUsers.map(async (user) => {
      const newStrikes = user.strikes + 1;
      let status = user.status;

      if (newStrikes >= 3) {
        status = "suspended";
      }

      await User.findByIdAndUpdate(user._id, {
        strikes: newStrikes,
        status,
      });

      // Notify user
      const message =
        status === "suspended"
          ? "Your account has been suspended due to late payments. Please contact support."
          : `Warning: You have ${newStrikes} strike(s) for late payments. Your account will be suspended if you reach 3 strikes.`;

      await Promise.all([
        sendEmail({
          to: user.email,
          subject: "Late Payment Notice",
          html: `<p>${message}</p>`,
        }),
        sendSMS({
          to: user.phone,
          body: message,
        }),
      ]);
    });

    await Promise.all(updatePromises);
    console.log(`Processed ${lateUsers.length} late payments`);
  } catch (error) {
    console.error("Late payment processing error:", error);
  }
};

// Close voting periods that have expired
exports.closeVotingPeriods = async () => {
  try {
    const now = new Date();

    // Find reports where deadline has passed but still pending
    const expiredReports = await DeathReport.find({
      deadline: { $lt: now },
      status: "pending",
    });

    const updatePromises = expiredReports.map(async (report) => {
      const approvalCount = report.votes.filter((vote) => vote.approved).length;

      if (approvalCount >= 10) {
        report.status = "under-review";
      } else {
        report.status = "rejected";

        // Notify reporter
        await sendEmail({
          to: report.reporter.email,
          subject: "Death Report Closed",
          html: `<p>Your death report has been closed without enough approvals. Only ${approvalCount} members approved your report.</p>`,
        });
      }

      await report.save();
    });

    await Promise.all(updatePromises);
    console.log(`Closed ${expiredReports.length} voting periods`);
  } catch (error) {
    console.error("Voting period closing error:", error);
  }
};

// Process approved payouts
exports.processApprovedPayouts = async () => {
  try {
    // Find reports approved but not yet paid
    const approvedReports = await DeathReport.find({
      status: "approved",
      payoutDate: { $exists: false },
    }).populate("reporter");

    const payoutPromises = approvedReports.map(async (report) => {
      try {
        // Process payment (integration with bank API would go here)
        // This is a mock implementation
        console.log(
          `Processing payout of ${report.payoutAmount} to ${report.bankDetails.accountHolder}`
        );

        // Mark as paid
        report.payoutDate = new Date();
        report.status = "paid";
        await report.save();

        // Notify reporter
        await sendEmail({
          to: report.reporter.email,
          subject: "Payout Processed",
          html: `<p>The payout for your death report has been processed. Amount: ZAR ${report.payoutAmount}</p>`,
        });
      } catch (error) {
        console.error(
          `Failed to process payout for report ${report._id}:`,
          error
        );
      }
    });

    await Promise.all(payoutPromises);
    console.log(`Processed ${approvedReports.length} payouts`);
  } catch (error) {
    console.error("Payout processing error:", error);
  }
};
