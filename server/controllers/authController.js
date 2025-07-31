const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  sendEmail,
  sendVerificationEmail,
} = require("../service/notificationService");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const { processPayment } = require("../service/payFastService");
const { generateReference } = require("../utils/helper");
const section = require("../models/section");
const beneficiary = require("../models/beneficiary");
const ActivationPayment = require("../models/activationPayment");

// @desc    Register a new user (initial step before payment)
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

    // Create inactive user (will be activated after payment)
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
      isActive: false,
      status: "pending",
    });

    // Generate payment reference
    const paymentReference = generateReference("ACT");

    // Create payment record
    const payment = await ActivationPayment.create({
      user: user._id,
      amount: 40,
      reference: paymentReference,
      purpose: "account-activation",
      status: "pending",
    });

    // Initiate PayFast payment
    const paymentData = {
      amount: 40,
      item_name: "Account Activation Fee",
      item_description: "Initial account activation payment",
      m_payment_id: paymentReference,
      custom_str1: user._id.toString(),
    };

    const paymentUrl = await processPayment(paymentData);

    res.status(201).json({
      success: true,
      message: "User registered. Proceed to payment.",
      paymentUrl,
      paymentReference,
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

// @desc    Handle PayFast payment notification (webhook)
// @route   POST /api/payments/webhook
// @access  Public
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { payment_status, m_payment_id, custom_str1 } = req.body;

    // Verify the payment with PayFast
    const isValid = await verifyPayFastPayment(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid payment");
    }

    // Find the payment record
    const payment = await Payment.findOne({ reference: m_payment_id });
    if (!payment) {
      return res.status(404).send("Payment record not found");
    }

    // Find the user
    const user = await User.findById(custom_str1);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (payment_status === "COMPLETE") {
      // Update payment record
      payment.status = "completed";
      payment.paymentDate = new Date();
      await payment.save();

      // Activate user account based on payment purpose
      if (payment.purpose === "account-activation") {
        user.isActive = true;
        user.status = "active";
        user.activationDate = new Date();
        await user.save();

        await sendEmail({
          to: user.email,
          subject: "Account Activated",
          html: `<p>Your account has been successfully activated. Welcome to Community Funeral Aid!</p>`,
        });
      } else if (payment.purpose === "reactivation") {
        user.status = "active";
        await user.save();

        await sendEmail({
          to: user.email,
          subject: "Account Reactivated",
          html: `<p>Your account has been reactivated. You can now access all services.</p>`,
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Payment webhook error:", error);
    res.status(500).send("Server error");
  }
};

// @desc    Check payment status
// @route   GET /api/payments/status/:reference
// @access  Public
exports.checkPaymentStatus = async (req, res) => {
  try {
    const payment = await ActivationPayment.findOne({
      reference: req.params.reference,
    });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    console.log(payment);

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
