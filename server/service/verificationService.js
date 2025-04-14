const axios = require("axios");
const FormData = require("form-data");
const Beneficiary = require("../models/beneficiary");

// Verify death certificate with Home Affairs API (mock implementation)
exports.verifyDeathCertificate = async (certificateFile) => {
  try {
    // In a real implementation, this would call the actual Home Affairs API
    // Here's a mock implementation for development

    const formData = new FormData();
    formData.append("file", certificateFile.buffer, {
      filename: certificateFile.originalname,
      contentType: certificateFile.mimetype,
    });

    // Mock API call
    const response = await axios.post(
      "https://api.home-affairs.gov.za/verify-death",
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 10000,
      }
    );

    // Mock response processing
    if (response.data && response.data.valid) {
      return {
        valid: true,
        deceasedInfo: response.data.deceasedInfo,
        verifiedAt: new Date(),
      };
    } else {
      return {
        valid: false,
        errors: response.data.errors || ["Certificate verification failed"],
      };
    }
  } catch (error) {
    console.error("Certificate verification error:", error);
    return {
      valid: false,
      errors: ["Failed to verify certificate"],
    };
  }
};

// Verify ID number with Home Affairs API (mock implementation)
exports.verifyIDNumber = async (idNumber) => {
  try {
    // Mock API call
    const response = await axios.get(
      `https://api.home-affairs.gov.za/verify-id/${idNumber}`,
      {
        timeout: 5000,
      }
    );

    // Mock response processing
    if (response.data && response.data.valid) {
      return {
        valid: true,
        personalInfo: response.data.personalInfo,
        verifiedAt: new Date(),
      };
    } else {
      return {
        valid: false,
        errors: response.data.errors || ["ID verification failed"],
      };
    }
  } catch (error) {
    console.error("ID verification error:", error);
    return {
      valid: false,
      errors: ["Failed to verify ID number"],
    };
  }
};

// Verify beneficiary eligibility
exports.verifyBeneficiary = async (beneficiaryData) => {
  const { idNumber, dob, relationship, accountHolderId } = beneficiaryData;

  // Check age
  const age = calculateAge(new Date(dob));
  if (age > 23) {
    return {
      valid: false,
      errors: ["Beneficiary must be under 23 years old"],
    };
  }

  // Check relationship
  if (!["child", "spouse"].includes(relationship)) {
    return {
      valid: false,
      errors: ["Invalid relationship type"],
    };
  }

  // Check if account holder has children (if beneficiary is a child)
  if (relationship === "child") {
    const accountHolder = await User.findById(accountHolderId);
    if (accountHolder.beneficiaries.some((b) => b.relationship === "child")) {
      return {
        valid: false,
        errors: ["Account holder already has a child beneficiary"],
      };
    }
  }

  // Verify ID number
  const idVerification = await this.verifyIDNumber(idNumber);
  if (!idVerification.valid) {
    return idVerification;
  }

  return {
    valid: true,
    verifiedAt: new Date(),
  };
};

function calculateAge(birthdate) {
  const diff = Date.now() - birthdate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
