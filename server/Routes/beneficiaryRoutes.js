const express = require("express");
const router = express.Router();
const {
  getBeneficiaryById,
  updateBeneficiary,
  deleteBeneficiary,
  verifyBeneficiary,
} = require("../controllers/beneficiaryController");
const { protect } = require("../middleware/auth");

router.use(protect);

router
  .route("/:id")
  .get(getBeneficiaryById)
  .put(updateBeneficiary)
  .delete(deleteBeneficiary);

router.post("/:id/verify", verifyBeneficiary);

module.exports = router;
