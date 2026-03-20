import api from './axiosInstance';

export const getExperts = (params) => api.get('/experts', { params });
export const getExpertById = (id) => api.get(`/experts/${id}`);
export const getMyProfile = () => api.get('/experts/me');
export const updateMyProfile = (data) => api.patch('/experts/me', data);
export const updateExpert = (id, data) => api.patch(`/experts/${id}`, data);
export const updateExpertStatus = (id, data) => api.patch(`/experts/${id}/status`, data);
export const getRecommendations = (projectId, limit) => api.get('/experts/recommendations', { params: { project_id: projectId, limit } });
