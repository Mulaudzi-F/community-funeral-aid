const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addBeneficiary,
  getUserBeneficiaries,
  getUserDeathReports,
  getUserContributions,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/profile").put(updateUserProfile);

router.route("/beneficiaries").get(getUserBeneficiaries).post(addBeneficiary);

router.get("/death-reports", getUserDeathReports);
router.get("/contributions", getUserContributions);

module.exports = router;
