const User = require("../models/user");
const Beneficiary = require("../models/beneficiary");
const DeathReport = require("../models/deathReport");
const Section = require("../models/section");
const Community = require("../models/community");
const { calculateAge } = require("../utils/helper");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("section", "name totalContributions")
      .populate("community", "name contributionAmount");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get active beneficiaries
    const activeBeneficiaries = await Beneficiary.countDocuments({
      accountHolder: req.user._id,
    });

    // Get user's reports
    const userReports = await DeathReport.countDocuments({
      reporter: req.user._id,
    });

    // Get pending reports
    const pendingReports = await DeathReport.countDocuments({
      reporter: req.user._id,
      status: { $in: ["pending", "under-review"] },
    });

    // Calculate next contribution date (1 month from last payment)
    const nextContributionDate = user.lastPaymentDate
      ? new Date(
          new Date(user.lastPaymentDate).setMonth(
            new Date(user.lastPaymentDate).getMonth() + 1
          )
        )
      : new Date();

    res.json({
      success: true,
      data: {
        activeBeneficiaries,
        maxBeneficiaries: 3, // Assuming max 3 beneficiaries per user
        yourReports: userReports,
        pendingReports,
        nextContributionAmount: user.community.contributionAmount,
        nextContributionDate: nextContributionDate.toISOString().split("T")[0],
        sectionName: user.section.name,
        communityName: user.community.name,
        totalContributions: user.section.totalContributions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = async (req, res) => {
  try {
    // Get user's section
    const user = await User.findById(req.user._id).select("section");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get section members
    const section = await Section.findById(user.section).select("members");
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Get recent death reports from section members
    const recentReports = await DeathReport.find({
      reporter: { $in: section.members },
    })
      .populate("deceased", "firstName lastName")
      .populate("reporter", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent payments (mock data - would come from payment service in real app)
    const recentPayments = await User.find({
      _id: { $in: section.members },
      lastPaymentDate: { $exists: true },
    })
      .select("firstName lastName lastPaymentDate")
      .sort({ lastPaymentDate: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        recentReports: recentReports.map((report) => ({
          id: report._id,
          deceasedName: `${report.deceased.firstName} ${report.deceased.lastName}`,
          reporterName: `${report.reporter.firstName} ${report.reporter.lastName}`,
          status: report.status,
          date: report.createdAt,
        })),
        recentPayments: recentPayments.map((payment) => ({
          memberName: `${payment.firstName} ${payment.lastName}`,
          amount: 15, // Fixed amount for now
          date: payment.lastPaymentDate,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get upcoming payments
// @route   GET /api/dashboard/payments
// @access  Private
exports.getUpcomingPayments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "community",
      "contributionAmount"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate next payment date (1 month from last payment or now if no payment yet)
    const lastPaymentDate = user.lastPaymentDate || new Date();
    const nextPaymentDate = new Date(
      new Date(lastPaymentDate).setMonth(lastPaymentDate.getMonth() + 1)
    );

    // Check if payment is overdue
    const today = new Date();
    const isOverdue = nextPaymentDate < today;

    // Get payment history (mock data - would come from payment service in real app)
    const paymentHistory = [];
    if (user.lastPaymentDate) {
      for (let i = 0; i < 6; i++) {
        paymentHistory.push({
          date: new Date(new Date().setMonth(new Date().getMonth() - i)),
          amount: user.community.contributionAmount,
          status: "paid",
        });
      }
    }

    res.json({
      success: true,
      data: {
        nextPayment: {
          amount: user.community.contributionAmount,
          dueDate: nextPaymentDate.toISOString().split("T")[0],
          isOverdue,
          daysRemaining: Math.ceil(
            (nextPaymentDate - today) / (1000 * 60 * 60 * 24)
          ),
        },
        paymentHistory,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
