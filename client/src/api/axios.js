import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "commununity-funeral-lu346oo84-fhatuwani-mulaudzis-projects.vercel.app";

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      //window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
