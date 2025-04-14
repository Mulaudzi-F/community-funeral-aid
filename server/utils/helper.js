// Calculate age from date of birth
exports.calculateAge = (birthdate) => {
  const diff = Date.now() - new Date(birthdate).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Format currency
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
};

// Validate South African ID number
exports.validateSAID = (idNumber) => {
  if (!idNumber || idNumber.length !== 13 || !/^\d+$/.test(idNumber)) {
    return false;
  }

  // Basic validation - check date parts
  const yy = parseInt(
    idNumber.substring(0, 2),
    (mm = parseInt(idNumber.substring(2, 4))),
    (dd = parseInt(idNumber.substring(4, 6)))
  );

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return false;
  }

  // TODO: Add more sophisticated validation if needed
  return true;
};

// Generate a random reference number
exports.generateReference = (prefix = "") => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
};
