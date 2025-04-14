const DeathReport = require("../models/deathReport");
const Beneficiary = require("../models/beneficiary");
const User = require("../models/user");
const Section = require("../models/section");
const Community = require("../models/community");
const { sendEmail, sendSMS } = require("../service/notificationService");
const { verifyDeathCertificate } = require("../service/verificationService");

// @desc    Create a new death report
// @route   POST /api/death-reports
// @access  Private
exports.createDeathReport = async (req, res) => {
  try {
    const { beneficiaryId, bankDetails, deathCertificate } = req.body;
    const userId = req.user._id;

    // Verify beneficiary belongs to user
    const beneficiary = await Beneficiary.findOne({
      _id: beneficiaryId,
      accountHolder: userId,
    });

    if (!beneficiary) {
      return res
        .status(400)
        .json({ message: "Beneficiary not found or does not belong to you" });
    }

    // Verify age of deceased
    const age = calculateAge(beneficiary.dob);
    if (age > 23) {
      return res
        .status(400)
        .json({ message: "Beneficiary must be under 23 years old" });
    }

    // Verify death certificate (integration with 3rd party API)
    const verificationResults = await verifyDeathCertificate(deathCertificate);
    if (!verificationResults.valid) {
      return res.status(400).json({
        message: "Death certificate verification failed",
        details: verificationResults.errors,
      });
    }

    // Create the death report
    const deathReport = new DeathReport({
      deceased: beneficiaryId,
      reporter: userId,
      deathCertificate,
      bankDetails,
      verificationData: verificationResults,
    });

    await deathReport.save();

    // Get section members (excluding the reporter)
    const user = await User.findById(userId);
    const section = await Section.findById(user.section).populate("members");

    const membersToNotify = section.members.filter(
      (member) => member._id.toString() !== userId.toString()
    );

    // Notify section members
    await notifySectionMembers(membersToNotify, deathReport._id);

    res.status(201).json(deathReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all death reports for user's section
// @route   GET /api/death-reports
// @access  Private
exports.getSectionDeathReports = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get reports where deceased is in the same section
    const reports = await DeathReport.find()
      .populate({
        path: "deceased",
        match: { accountHolder: { $in: user.section.members } },
        populate: { path: "accountHolder" },
      })
      .populate("reporter")
      .sort({ createdAt: -1 });

    // Filter out reports with no deceased (due to the match condition)
    const filteredReports = reports.filter(
      (report) => report.deceased !== null
    );

    res.json(filteredReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Vote on a death report
// @route   POST /api/death-reports/:id/vote
// @access  Private
exports.voteOnDeathReport = async (req, res) => {
  try {
    const { approved, comment } = req.body;
    const reportId = req.params.id;
    const userId = req.user._id;

    // Check if report exists
    const deathReport = await DeathReport.findById(reportId);
    if (!deathReport) {
      return res.status(404).json({ message: "Death report not found" });
    }

    // Check if user has already voted
    const alreadyVoted = deathReport.votes.some(
      (vote) => vote.voter.toString() === userId.toString()
    );

    if (alreadyVoted) {
      return res
        .status(400)
        .json({ message: "You have already voted on this report" });
    }

    // Check if voting deadline has passed
    if (new Date() > deathReport.deadline) {
      return res.status(400).json({ message: "Voting deadline has passed" });
    }

    // Add vote
    deathReport.votes.push({
      voter: userId,
      approved,
      comment,
    });

    // Check if we've reached 10 approvals
    const approvalCount = deathReport.votes.filter(
      (vote) => vote.approved
    ).length;
    if (approvalCount >= 10) {
      deathReport.status = "under-review"; // Ready for admin review
    }

    await deathReport.save();

    res.json(deathReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Admin review of death report
// @route   PUT /api/death-reports/:id/review
// @access  Private/Admin
exports.reviewDeathReport = async (req, res) => {
  try {
    const { approved, adminComments } = req.body;
    const reportId = req.params.id;

    const deathReport = await DeathReport.findById(reportId)
      .populate("deceased")
      .populate("reporter");

    if (!deathReport) {
      return res.status(404).json({ message: "Death report not found" });
    }

    if (deathReport.status !== "under-review") {
      return res
        .status(400)
        .json({ message: "Report is not ready for admin review" });
    }

    if (approved) {
      // Approve the report
      deathReport.status = "approved";
      deathReport.adminApproved = true;

      // Calculate payout amount (would be based on community rules)
      const community = await Community.findById(
        deathReport.reporter.community
      );
      const payoutAmount = community.contributionAmount * 0.85; // 85% to family

      deathReport.payoutAmount = payoutAmount;

      // Process payment (integration with payment gateway would go here)
      // This would be an async process in a real application
      await processPayout(deathReport.bankDetails, payoutAmount);

      deathReport.payoutDate = new Date();
      deathReport.status = "paid";

      // Update community/section balances
      await updateCommunityBalances(
        deathReport.reporter.community,
        deathReport.reporter.section,
        payoutAmount
      );

      // Notify reporter of approval and payment
      await sendPaymentConfirmation(deathReport.reporter, payoutAmount);
    } else {
      // Reject the report
      deathReport.status = "rejected";

      // Notify reporter of rejection
      await sendRejectionNotice(deathReport.reporter, adminComments);
    }

    await deathReport.save();

    res.json(deathReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper functions
function calculateAge(birthdate) {
  const diff = Date.now() - birthdate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

async function notifySectionMembers(members, reportId) {
  const notificationPromises = members.map((member) => {
    const message = `A new death has been reported in your section. Please review and vote within 24 hours.`;

    return Promise.all([
      sendEmail({
        to: member.email,
        subject: "New Death Report in Your Section",
        html: `<p>${message}</p><p>Report ID: ${reportId}</p>`,
      }),
      sendSMS({
        to: member.phone,
        body: message,
      }),
    ]);
  });

  await Promise.all(notificationPromises);
}

async function processPayout(bankDetails, amount) {
  // Integration with PayFast/Stripe would go here
  // This is a mock implementation
  console.log(`Processing payout of ${amount} to ${bankDetails.accountHolder}`);
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function updateCommunityBalances(communityId, sectionId, payoutAmount) {
  // Update section balance
  await Section.findByIdAndUpdate(sectionId, {
    $inc: {
      currentBalance: -payoutAmount,
      totalPayouts: payoutAmount,
    },
  });

  // Update community balance (15% admin fee)
  const adminFee = payoutAmount * 0.15;
  await Community.findByIdAndUpdate(communityId, {
    $inc: {
      currentBalance: adminFee,
    },
  });
}

async function sendPaymentConfirmation(user, amount) {
  await sendEmail({
    to: user.email,
    subject: "Death Report Approved - Payment Processed",
    html: `<p>Your death report has been approved and a payment of ZAR ${amount.toFixed(
      2
    )} has been processed.</p>`,
  });

  await sendSMS({
    to: user.phone,
    body: `Death report approved. Payment of ZAR ${amount.toFixed(
      2
    )} processed.`,
  });
}

async function sendRejectionNotice(user, reason) {
  await sendEmail({
    to: user.email,
    subject: "Death Report Rejected",
    html: `<p>Your death report has been rejected. Reason: ${
      reason || "Not specified"
    }</p>`,
  });

  await sendSMS({
    to: user.phone,
    body: `Death report rejected. Check email for details.`,
  });
}
