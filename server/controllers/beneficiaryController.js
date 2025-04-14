const Beneficiary = require("../models/beneficiary");
const User = require("../models/user");
const { calculateAge } = require("../utils/helper");
const { verifyIDNumber } = require("../service/verificationService");

// @desc    Get beneficiary by ID
// @route   GET /api/beneficiaries/:id
// @access  Private
exports.getBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id).populate(
      "accountHolder",
      "firstName lastName"
    );

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Verify the requesting user owns this beneficiary
    if (beneficiary.accountHolder._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this beneficiary",
      });
    }

    res.json({ success: true, data: beneficiary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update beneficiary
// @route   PUT /api/beneficiaries/:id
// @access  Private
exports.updateBeneficiary = async (req, res) => {
  try {
    const { firstName, lastName, dob } = req.body;

    // Get existing beneficiary
    const existingBeneficiary = await Beneficiary.findById(req.params.id);
    if (!existingBeneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Verify ownership
    if (
      existingBeneficiary.accountHolder.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this beneficiary",
      });
    }

    // Verify age if dob is being updated
    if (dob) {
      const age = calculateAge(new Date(dob));
      if (age > 23) {
        return res.status(400).json({
          success: false,
          message: "Beneficiary must be under 23 years old",
        });
      }
    }

    const beneficiary = await Beneficiary.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, dob },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: beneficiary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete beneficiary
// @route   DELETE /api/beneficiaries/:id
// @access  Private
exports.deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Verify ownership
    if (beneficiary.accountHolder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this beneficiary",
      });
    }

    await Beneficiary.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {},
      message: "Beneficiary removed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Verify beneficiary
// @route   POST /api/beneficiaries/:id/verify
// @access  Private
exports.verifyBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found",
      });
    }

    // Verify ownership
    if (beneficiary.accountHolder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify this beneficiary",
      });
    }

    // Verify ID number with external service
    const verificationResult = await verifyIDNumber(beneficiary.idNumber);
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: "Beneficiary verification failed",
        errors: verificationResult.errors,
      });
    }

    beneficiary.isVerified = true;
    beneficiary.verificationData = verificationResult;
    await beneficiary.save();

    res.json({
      success: true,
      data: beneficiary,
      message: "Beneficiary verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
