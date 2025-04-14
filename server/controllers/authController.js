const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendEmail } = require("../service/notificationService");
const bcrypt = require("bcrypt");
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
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
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
      password: hashedPassword,
      community: communityId,
      section: sectionId,
      address,
      paymentMethod,
      addressProof,
      idDocument,
      isActive: false, // Will be activated after payment
    });

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
