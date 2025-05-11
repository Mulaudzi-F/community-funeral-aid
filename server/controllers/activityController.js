const Activity = require("../models/Activity");
const User = require("../models/user");
const { sendEmail } = require("../service/notificationService");

// @desc    Get user activities
// @route   GET /api/activities
// @access  Private
exports.getUserActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark as read if first page
    if (page === 1) {
      await Activity.updateMany(
        { user: req.user._id, read: false },
        { $set: { read: true } }
      );
    }

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  try {
    const { userId, type, title, description, metadata } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const activity = await Activity.create({
      user: userId,
      type,
      title,
      description,
      metadata,
    });

    // Send email notification for important activities
    if (["report_approved", "alert"].includes(type)) {
      await sendEmail({
        to: user.email,
        subject: title,
        html: `<p>${description}</p>`,
      });
    }

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get unread count
// @route   GET /api/activities/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Activity.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
