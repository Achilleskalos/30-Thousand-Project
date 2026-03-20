import api from './axiosInstance';

export const getConfig = () => api.get('/config');
export const updateConfig = (key, data) => api.patch(`/config/${key}`, data);
