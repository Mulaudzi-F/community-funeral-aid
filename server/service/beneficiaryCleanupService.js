const Beneficiary = require("../models/beneficiary");
const User = require("../models/user");
const { sendEmail } = require("./notificationService");

// Run daily cleanup of beneficiaries over 25
exports.cleanupAgedBeneficiaries = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 25);

    // Find beneficiaries who are now 25 or older
    const agedBeneficiaries = await Beneficiary.find({
      dob: { $lte: cutoffDate },
    }).populate("accountHolder");

    if (agedBeneficiaries.length === 0) {
      console.log("No aged beneficiaries to cleanup");
      return;
    }

    // Notify users and delete beneficiaries
    const deletionPromises = agedBeneficiaries.map(async (beneficiary) => {
      try {
        // Send notification to account holder
        await sendEmail({
          to: beneficiary.accountHolder.email,
          subject: "Beneficiary Age Limit Reached",
          html: `
            <p>Dear ${beneficiary.accountHolder.firstName},</p>
            <p>Your beneficiary ${beneficiary.firstName} ${beneficiary.lastName} 
            has reached the maximum age limit of 25 years and has been removed 
            from your beneficiary list.</p>
            <p>If this person is your spouse, you may re-add them with updated 
            information if needed.</p>
            <p>Community Funeral Aid Team</p>
          `,
        });

        const io = require("../server").io;
        io.to(`user-${beneficiary.accountHolder._id}`).emit(
          "beneficiary-removed",
          {
            beneficiaryName: `${beneficiary.firstName} ${beneficiary.lastName}`,
            beneficiaryId: beneficiary._id,
          }
        );
        // Delete the beneficiary
        await Beneficiary.findByIdAndDelete(beneficiary._id);

        return beneficiary._id;
      } catch (error) {
        console.error(
          `Error processing beneficiary ${beneficiary._id}:`,
          error
        );
        return null;
      }
    });

    const deletedIds = (await Promise.all(deletionPromises)).filter((id) => id);

    console.log(
      `Removed ${deletedIds.length} beneficiaries who reached age limit`
    );
    return deletedIds;
  } catch (error) {
    console.error("Error in beneficiary cleanup:", error);
    throw error;
  }
};
