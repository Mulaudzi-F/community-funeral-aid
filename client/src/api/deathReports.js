import api from "./axios";

export const createDeathReport = async (reportData) => {
  const formData = new FormData();

  // Append all fields to formData
  Object.keys(reportData).forEach((key) => {
    if (key === "deathCertificate") {
      formData.append(key, reportData[key]);
    } else if (typeof reportData[key] === "object") {
      formData.append(key, JSON.stringify(reportData[key]));
    } else {
      formData.append(key, reportData[key]);
    }
  });

  const response = await api.post("/death-reports", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getDeathReports = async () => {
  const response = await api.get("/death-reports");
  return response.data;
};

export const getDeathReportById = async (id) => {
  const response = await api.get(`/death-reports/${id}`);
  return response.data;
};

export const voteOnDeathReport = async (id, voteData) => {
  const response = await api.post(`/death-reports/${id}/vote`, voteData);
  return response.data;
};
