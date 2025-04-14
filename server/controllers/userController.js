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
    if (age > 23) {
      return res.status(400).json({
        success: false,
        message: "Beneficiary must be under 23 years old",
      });
    }

    // Check relationship
    if (!["child", "spouse"].includes(relationship)) {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship type",
      });
    }

    // Check if ID number already exists
    const existingBeneficiary = await Beneficiary.findOne({ idNumber });
    if (existingBeneficiary) {
      return res.status(400).json({
        success: false,
        message: "ID number already registered",
      });
    }

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
