import axios from "axios";

const API_BASE = "http://localhost:8000";

export const getDistricts = async () => {
  const response = await axios.get(`${API_BASE}/districts`);
  return response.data;
};

export const getPriorityRanking = async () => {
  const response = await axios.get("http://localhost:8000/priority-ranking");
  return response.data;
};

export const getAlerts = async () => {
  const response = await axios.get(`${API_BASE}/api/alerts/anomalies`);
  return response.data;
};

export const getDistrictNotes = async (district = "") => {
  const params = district ? { district } : {};
  const response = await axios.get(`${API_BASE}/api/district-notes`, { params });
  return response.data;
};

export const createDistrictNote = async (payload) => {
  const response = await axios.post(`${API_BASE}/api/district-notes`, payload);
  return response.data;
};

export const getSchemeRecommendation = async (districtName) => {
  const response = await axios.get(
    `${API_BASE}/scheme-recommendation/${encodeURIComponent(districtName)}`,
  );
  return response.data;
};
