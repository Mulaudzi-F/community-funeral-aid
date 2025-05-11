const express = require("express");
const router = express.Router();
const {
  getSectionById,
  createSection,
  updateSection,
  getSectionMembers,
  getSectionReports,
  getSectionContributions,
  getSectionFinances,
} = require("../controllers/sectionController");
const { protect, admin } = require("../middleware/auth");

router.route("/:id").get(getSectionById).put(updateSection);
router.post("/:id", createSection);
router.use(protect);
//router.get("/:id/members", getSectionMembers);
router.get("/:id/reports", getSectionReports);
router.get("/:id/contributions", getSectionContributions);
router.get("/:id/finances", getSectionFinances);

// Admin-only routes
router.use(admin);

module.exports = router;
