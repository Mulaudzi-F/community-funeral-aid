const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  sendEmail,
  sendVerificationEmail,
} = require("../service/notificationService");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const section = require("../models/section");
const beneficiary = require("../models/beneficiary");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    idNumber,
    dob,
    email,
    phone,
    password,
    communityId,
    sectionId,
    address,
    paymentMethod,
    addressProof,
    idDocument,
    isAdmin,
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check ID number uniqueness
    const idExists = await User.findOne({ idNumber });
    if (idExists) {
      return res.status(400).json({ message: "ID number already registered" });
    }

    // Create user (initially inactive)
    const user = await User.create({
      firstName,
      lastName,
      idNumber,
      dob: new Date(dob),
      email,
      phone,
      password,
      community: communityId,
      section: sectionId,
      address,
      paymentMethod,
      addressProof,
      idDocument,
      isAdmin,
      isActive: false, // Will be activated after payment
    });
    await beneficiary.create({
      firstName: user.firstName,
      lastName: user.lastName,
      idNumber: user.idNumber,
      dob: user.dob,
      relationship: "AccountHolder",
      accountHolder: user._id,
      isAlive: true,
    });

    const userSection = await section.findById(user.section);

    userSection.members.push(user._id);
    await userSection.save();

    // Process payment (integration with PayFast/Stripe would go here)
    // This would be handled by the frontend typically

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Welcome to Community Funeral Aid",
      html: `<p>Thank you for registering. Please complete your registration by making the initial payment.</p>`,
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Check if account is suspended or banned
    if (user.status !== "active") {
      return res.status(401).json({
        message: `Account is ${user.status}. Please contact support.`,
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    const {
      _id,
      firstName,
      lastName,
      email: loggedInEmail,
      isActive,
      status,
    } = user;
    res.json({
      token,
      user: { _id, firstName, lastName, loggedInEmail, isActive, status },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("community", "name")
      .populate("section", "name");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Optionally: Add token to blacklist if using token invalidation
    // await TokenBlacklist.create({ token: req.token });

    // Clear the token from client-side storage
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Get user from database
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Password Changed",
      html: `<p>Your password has been successfully changed.</p>`,
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//@desc    Send verification email
// @route   POST /api/auth/send-verification
// @access  Private
exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    // Generate token and set expiration (1 hour)
    const token = crypto.randomBytes(20).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verificationUrl);

    res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=true`);
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=false`);
  }
};
