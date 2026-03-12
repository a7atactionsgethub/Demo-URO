import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Patients
export const getPatients = () => api.get("/patients").then(r => r.data);
export const getPatient = (id) => api.get(`/patients/${id}`).then(r => r.data);
export const createPatient = (data) => api.post("/patients", data).then(r => r.data);
export const deletePatient = (id) => api.delete(`/patients/${id}`).then(r => r.data);

// Readings
export const getReadings = (params) => api.get("/readings", { params }).then(r => r.data);
export const getLatestReadings = () => api.get("/readings/latest").then(r => r.data);
export const postReading = (data) => api.post("/readings", data).then(r => r.data);

// Alerts
export const getAlerts = (params) => api.get("/alerts", { params }).then(r => r.data);
export const getAlertCount = () => api.get("/alerts/count").then(r => r.data);
