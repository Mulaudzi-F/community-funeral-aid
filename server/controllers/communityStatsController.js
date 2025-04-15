const Community = require("../models/community");
const Section = require("../models/section");
const User = require("../models/user");
const DeathReport = require("../models/deathReport");
const Contribution = require("../models/Contribution");
const { formatCurrency } = require("../utils/helper");

// @desc    Get community statistics
// @route   GET /api/communities/:id/stats
// @access  Private (Community Admin)
exports.getCommunityStats = async (req, res) => {
  try {
    const communityId = req.params.id;

    // Basic verification that user has access to this community
    const user = await User.findById(req.user._id);
    if (!user.community.equals(communityId) && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these statistics",
      });
    }

    // Get all sections in this community
    const sections = await Section.find({ community: communityId });

    // Get all members across all sections
    const memberIds = sections.flatMap((section) => section.members);
    const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];

    // Get counts
    const totalMembers = uniqueMemberIds.length;
    const activeMembers = await User.countDocuments({
      _id: { $in: uniqueMemberIds },
      status: "active",
    });

    // Get financial data
    const totalContributions = sections.reduce(
      (sum, section) => sum + section.totalContributions,
      0
    );
    const totalPayouts = sections.reduce(
      (sum, section) => sum + section.totalPayouts,
      0
    );

    // Get monthly activity for the last 12 months
    const monthlyActivity = await getMonthlyActivity(communityId);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalContributions,
        totalPayouts,
        monthlyActivity,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to generate monthly activity data
async function getMonthlyActivity(communityId) {
  const months = [];
  const now = new Date();

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      date,
      contributions: 0,
      payouts: 0,
    });
  }

  // Get contributions for each month
  const contributions = await Contribution.aggregate([
    {
      $match: {
        community: mongoose.Types.ObjectId(communityId),
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          $lte: now,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Get payouts for each month
  const payouts = await DeathReport.aggregate([
    {
      $match: {
        status: "paid",
        payoutDate: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          $lte: now,
        },
        reporter: { $in: await getCommunityUserIds(communityId) },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$payoutDate" },
          month: { $month: "$payoutDate" },
        },
        total: { $sum: "$payoutAmount" },
      },
    },
  ]);

  // Map the aggregation results to our months array
  contributions.forEach((item) => {
    const month = months.find(
      (m) =>
        m.date.getFullYear() === item._id.year &&
        m.date.getMonth() + 1 === item._id.month
    );
    if (month) month.contributions = item.total;
  });

  payouts.forEach((item) => {
    const month = months.find(
      (m) =>
        m.date.getFullYear() === item._id.year &&
        m.date.getMonth() + 1 === item._id.month
    );
    if (month) month.payouts = item.total;
  });

  return months;
}

// Helper to get all user IDs in a community
async function getCommunityUserIds(communityId) {
  const sections = await Section.find({ community: communityId });
  const memberIds = sections.flatMap((section) => section.members);
  return [...new Set(memberIds.map((id) => id.toString()))];
}
