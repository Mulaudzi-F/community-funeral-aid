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
      .populate("members", "firstName lastName address phone status");

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
    const { name } = req.body;

    const communityId = req.params.id;

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
/*exports.getSectionMembers = async (req, res) => {
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
};*/

// @desc    Get section reports
// @route   GET /api/sections/:id/reports
// @access  Private
exports.getSectionReports = async (req, res) => {
  try {
    // First verify the section exists

    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Get all users in this section
    const usersInSection = await User.find(
      { section: req.params.id },
      "_id firstName lastName"
    );

    // Extract just the user IDs
    const userIds = usersInSection.map((user) => user._id);

    // Find reports where the reporter is in this section
    const reports = await DeathReport.find({
      reporter: { $in: userIds },
    })
      .populate({
        path: "deceased",
        select: "firstName lastName relationship dob",
      })
      .populate({
        path: "reporter",
        select: "firstName lastName section community",
        populate: [
          {
            path: "section",
            select: "name",
          },
          {
            path: "community",
            select: "name",
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports,
      meta: {
        section: section.name,
        totalReports: reports.length,
        totalMembers: usersInSection.length,
      },
    });
  } catch (error) {
    console.error("Error in getSectionReports:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
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

// @desc    Get section finances
// @route   GET /api/sections/:id/finances
// @access  Private
exports.getSectionFinances = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate(
      "community",
      "contributionAmount adminFeePercentage"
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Get all members in this section
    const members = await User.find({ section: section._id }).select(
      "firstName lastName lastPaymentDate status"
    );

    // Calculate active members
    const activeMembers = members.filter((m) => m.status === "active").length;

    // Calculate expected monthly contributions
    const expectedFuneralContribution =
      activeMembers * section.community.contributionAmount;

    // Get recent transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentReports = await DeathReport.find({
      reporter: { $in: section.members },
      status: "paid",
      payoutDate: { $gte: threeMonthsAgo },
    })
      .select("payoutDate payoutAmount")
      .sort({ payoutDate: -1 });

    // Prepare response
    const finances = {
      sectionId: section._id,
      sectionName: section.name,
      communityName: section.community.name,
      currentBalance: section.currentBalance,
      totalContributions: section.totalContributions,
      totalPayouts: section.totalPayouts,
      contributionAmount: section.community.contributionAmount,
      adminFeePercentage: section.community.adminFeePercentage,
      memberStats: {
        total: members.length,
        active: activeMembers,
        suspended: members.filter((m) => m.status === "suspended").length,
      },
      expectedFuneralContribution: expectedFuneralContribution,
      recentPayouts: recentReports,
      lastUpdated: new Date(),
    };

    res.json({
      success: true,
      data: finances,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
