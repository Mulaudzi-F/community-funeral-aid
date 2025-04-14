const User = require("../models/user");
const DeathReport = require("../models/deathReport");
const Community = require("../models/community");
const Section = require("../models/section");
const { sendSystemNotification } = require("../service/notificationService");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("community", "name")
      .populate("section", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("community", "name")
      .populate("section", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all death reports
// @route   GET /api/admin/death-reports
// @access  Private/Admin
exports.getAllDeathReports = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const reports = await DeathReport.find(query)
      .populate("deceased")
      .populate("reporter", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get pending death reports
// @route   GET /api/admin/death-reports/pending
// @access  Private/Admin
exports.getPendingReports = async (req, res) => {
  try {
    const reports = await DeathReport.find({
      status: "under-review",
      adminApproved: false,
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

// @desc    Get community finances
// @route   GET /api/admin/finances
// @access  Private/Admin
exports.getCommunityFinances = async (req, res) => {
  try {
    const communities = await Community.find()
      .select("name currentBalance")
      .sort({ name: 1 });

    const sections = await Section.find()
      .select("name community currentBalance totalContributions totalPayouts")
      .populate("community", "name")
      .sort({ name: 1 });

    const totalCommunityBalance = communities.reduce(
      (sum, community) => sum + community.currentBalance,
      0
    );

    const totalSectionBalance = sections.reduce(
      (sum, section) => sum + section.currentBalance,
      0
    );

    const totalContributions = sections.reduce(
      (sum, section) => sum + section.totalContributions,
      0
    );

    const totalPayouts = sections.reduce(
      (sum, section) => sum + section.totalPayouts,
      0
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalCommunityBalance,
          totalSectionBalance,
          totalContributions,
          totalPayouts,
        },
        communities,
        sections,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Send system notification
// @route   POST /api/admin/notify
// @access  Private/Admin
exports.sendSystemNotification = async (req, res) => {
  try {
    const { title, message, recipients } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    let users = [];
    if (recipients === "all") {
      users = await User.find({ status: "active" }).select("email phone");
    } else if (recipients === "admins") {
      users = await User.find({ isAdmin: true, status: "active" }).select(
        "email phone"
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid recipients value",
      });
    }

    await sendSystemNotification(users, title, message);

    res.json({
      success: true,
      message: `Notification sent to ${users.length} users`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
