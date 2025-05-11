import api from "./axios";

export const createDeathReport = async (reportData) => {
  const response = await api.post("/death-reports", reportData, {
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
