const Section = require("../models/section");
const Community = require("../models/community");
const User = require("../models/user");
const DeathReport = require("../models/deathReport");
const { sendEmail } = require("../service/notificationService");

// @desc    Get section by ID
// @route   GET /api/sections/:id
// @access  Private
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate("community", "name")
      .populate("members", "firstName lastName email phone");

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.json({ success: true, data: section });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create section
// @route   POST /api/sections
// @access  Private/Admin
exports.createSection = async (req, res) => {
  try {
    const { name, communityId } = req.body;

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if section already exists in this community
    const existingSection = await Section.findOne({
      name,
      community: communityId,
    });
    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: "Section with this name already exists in the community",
      });
    }

    const section = await Section.create({
      name,
      community: communityId,
    });

    // Add section to community
    community.sections.push(section._id);
    await community.save();

    res.status(201).json({ success: true, data: section });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private
exports.updateSection = async (req, res) => {
  try {
    const { name } = req.body;

    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.json({ success: true, data: section });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get section members
// @route   GET /api/sections/:id/members
// @access  Private
exports.getSectionMembers = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate(
      "members",
      "firstName lastName email phone status"
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    res.json({ success: true, data: section.members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get section reports
// @route   GET /api/sections/:id/reports
// @access  Private
exports.getSectionReports = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const reports = await DeathReport.find({
      reporter: { $in: section.members },
    })
      .populate("deceased")
      .populate("reporter", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get section contributions
// @route   GET /api/sections/:id/contributions
// @access  Private
exports.getSectionContributions = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const community = await Community.findById(section.community);

    const contributions = {
      totalContributions: section.totalContributions,
      totalPayouts: section.totalPayouts,
      currentBalance: section.currentBalance,
      contributionAmount: community.contributionAmount,
      nextContributionDate: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ),
    };

    res.json({ success: true, data: contributions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
