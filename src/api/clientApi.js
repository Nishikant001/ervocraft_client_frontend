import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://ervocraft-clinets-3.onrender.com/api/clients";

// Add client
export const addClient = (data) => axios.post(`${API_BASE}/add`, data);

// Get clients (optional: category + status)
export const getClients = (category = "All", status = "All") =>
  axios.get(`${API_BASE}?category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`);

// Send email to client
export const sendEmailToClient = (id) => axios.post(`${API_BASE}/send-email/${id}`);

// Update client
export const updateClient = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);

// Delete client
export const deleteClient = (id) =>
  axios.delete(`${API_BASE}/${id}`);

// ✅ Dashboard report
export const getDashboardReport = () =>
  axios.get(`${API_BASE}/report/dashboard`);
