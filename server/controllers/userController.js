const User = require("../models/user");
const Beneficiary = require("../models/beneficiary");
const DeathReport = require("../models/deathReport");
const Section = require("../models/section");
const { calculateAge } = require("../utils/helper");
const { sendEmail } = require("../service/notificationService");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's beneficiaries
// @route   GET /api/users/beneficiaries
// @access  Private
exports.getUserBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({
      accountHolder: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: beneficiaries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Add beneficiary
// @route   POST /api/users/beneficiaries
// @access  Private
exports.addBeneficiary = async (req, res) => {
  try {
    const { firstName, lastName, idNumber, dob, relationship } = req.body;

    // Verify age
    const age = calculateAge(new Date(dob));
    if (age > 25) {
      return res.status(400).json({
        success: false,
        message: "Beneficiary must be under 25 years old",
      });
    }

    // Check relationship
    if (!["child", "spouse"].includes(relationship)) {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship type",
      });
    }

    // Check if ID number exists but is soft-deleted (over 25)
    const existingDeleted = await Beneficiary.findOne({
      idNumber,
      isDeleted: true,
    });

    if (existingDeleted) {
      // For spouse relationships, allow re-adding with verification
      if (relationship === "spouse") {
        await Beneficiary.findByIdAndDelete(existingDeleted._id);
      } else {
        return res.status(400).json({
          success: false,
          message:
            "This person was previously a beneficiary and reached age limit",
        });
      }
    }

    // Check if active beneficiary with same ID exists
    const existingActive = await Beneficiary.findOne({
      idNumber,
      isDeleted: { $ne: true },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: "This person is already a beneficiary for another account",
      });
    }

    // Create the beneficiary
    const beneficiary = await Beneficiary.create({
      firstName,
      lastName,
      idNumber,
      dob,
      relationship,
      accountHolder: req.user._id,
    });

    res.status(201).json({ success: true, data: beneficiary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's death reports
// @route   GET /api/users/death-reports
// @access  Private
exports.getUserDeathReports = async (req, res) => {
  try {
    const reports = await DeathReport.find({ reporter: req.user._id })
      .populate("deceased")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's contributions
// @route   GET /api/users/contributions
// @access  Private
exports.getUserContributions = async (req, res) => {
  try {
    const section = await Section.findOne({ members: req.user._id });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // In a real app, you would query payment records for this user
    const contributions = {
      totalPaid: section.totalContributions / section.members.length,
      lastPaymentDate: req.user.lastPaymentDate,
      nextPaymentDue: new Date(
        new Date(req.user.lastPaymentDate).setMonth(
          new Date(req.user.lastPaymentDate).getMonth() + 1
        )
      ),
    };

    res.json({ success: true, data: contributions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Check for missed payments and suspend accounts
// @route   POST /api/users/check-payments
// @access  Private/Admin (should be called by a scheduled job)
exports.checkMissedPayments = async (req, res) => {
  try {
    // Get all sections with pending death reports
    const sectionsWithPendingReports = await DeathReport.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$section" } },
    ]);

    // For each section, find members who missed payments
    for (const section of sectionsWithPendingReports) {
      const sectionId = section._id;

      // Find members who missed 2 or more payments
      const membersToSuspend = await User.aggregate([
        { $match: { section: sectionId, status: "active" } },
        {
          $lookup: {
            from: "deathreports",
            localField: "_id",
            foreignField: "reporter",
            as: "reports",
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            missedPayments: {
              $size: {
                $filter: {
                  input: "$reports",
                  as: "report",
                  cond: {
                    $and: [
                      { $eq: ["$$report.status", "approved"] },
                      { $eq: ["$$report.paymentStatus", "missed"] },
                    ],
                  },
                },
              },
            },
          },
        },
        { $match: { missedPayments: { $gte: 2 } } },
      ]);

      // Suspend accounts
      for (const member of membersToSuspend) {
        await User.findByIdAndUpdate(member._id, {
          status: "suspended",
          suspensionReason: "Missed 2 or more contribution payments",
          suspensionDate: new Date(),
        });

        await sendEmail({
          to: member.email,
          subject: "Account Suspended",
          html: `
            <p>Dear ${member.firstName},</p>
            <p>Your account has been suspended due to missing 2 or more contribution payments.</p>
            <p>To reactivate your account, please make a reactivation payment of R40.</p>
            <p>During suspension, you cannot access services or receive benefits.</p>
          `,
        });
      }
    }

    res.json({
      success: true,
      message: `Payment check completed. ${membersToSuspend.length} accounts suspended.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Initiate account reactivation payment
// @route   POST /api/users/reactivate
// @access  Private (for suspended users)
exports.initiateReactivation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.status !== "suspended") {
      return res.status(400).json({
        success: false,
        message: "Account is not suspended",
      });
    }

    // Generate payment reference
    const paymentReference = generatePaymentReference("REACT");

    // Create payment record
    const payment = await Payment.create({
      user: user._id,
      amount: 40,
      reference: paymentReference,
      purpose: "reactivation",
      status: "pending",
    });

    // Initiate PayFast payment
    const paymentData = {
      amount: 40,
      item_name: "Account Reactivation Fee",
      item_description: "Account reactivation payment after suspension",
      m_payment_id: paymentReference,
      custom_str1: user._id.toString(),
    };

    const paymentUrl = await processPayment(paymentData);

    res.json({
      success: true,
      message: "Proceed to reactivation payment",
      paymentUrl,
      paymentReference,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
