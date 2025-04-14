const Community = require("../models/community");
const Section = require("../models/section");
const User = require("../models/user");
const { sendEmail } = require("../service/notificationService");

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
exports.getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .sort({ name: 1 })
      .select("-members");

    res.json({ success: true, data: communities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single community
// @route   GET /api/communities/:id
// @access  Public
exports.getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate(
      "sections",
      "name memberCount"
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    res.json({ success: true, data: community });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create community
// @route   POST /api/communities
// @access  Private/Admin
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, contributionAmount, adminFeePercentage } =
      req.body;

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: "Community with this name already exists",
      });
    }

    const community = await Community.create({
      name,
      description,
      contributionAmount: contributionAmount || 15,
      adminFeePercentage: adminFeePercentage || 20,
    });

    res.status(201).json({ success: true, data: community });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update community
// @route   PUT /api/communities/:id
// @access  Private/Admin
exports.updateCommunity = async (req, res) => {
  try {
    const { name, description, contributionAmount, adminFeePercentage } =
      req.body;

    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { name, description, contributionAmount, adminFeePercentage },
      { new: true, runValidators: true }
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    res.json({ success: true, data: community });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get community sections
// @route   GET /api/communities/:id/sections
// @access  Public
exports.getCommunitySections = async (req, res) => {
  try {
    const sections = await Section.find({ community: req.params.id })
      .select("-members")
      .sort({ name: 1 });

    res.json({ success: true, data: sections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
