import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getForecast = (city) => api.get(`/api/predict/${city}`);
export const getRisk = (city) => api.get(`/api/risk/${city}`);
export const getAnomalies = (city) => api.get(`/api/anomalies/${city}`);
export const getHotspots = (city) => api.get(`/api/hotspots/${city}`);

export const reportViolation = (formData) => {
    return api.post('/api/report_violation', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default api;
