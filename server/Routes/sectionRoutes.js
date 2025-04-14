const express = require("express");
const router = express.Router();
const {
  getSectionById,
  createSection,
  updateSection,
  getSectionMembers,
  getSectionReports,
  getSectionContributions,
} = require("../controllers/sectionController");
const { protect, admin } = require("../middleware/auth");

router.route("/:id").get(getSectionById).put(updateSection);
router.use(protect);
router.get("/:id/members", getSectionMembers);
router.get("/:id/reports", getSectionReports);
router.get("/:id/contributions", getSectionContributions);

// Admin-only routes
router.use(admin);

router.post("/", createSection);

module.exports = router;
