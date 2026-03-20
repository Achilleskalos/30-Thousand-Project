import api from './axiosInstance';

export const getSolutions = (params) => api.get('/solutions', { params });
export const getMySolutions = (params) => api.get('/solutions/my', { params });
export const getSolutionById = (id) => api.get(`/solutions/${id}`);
export const createSolution = (data) => api.post('/solutions', data);
export const updateSolution = (id, data) => api.patch(`/solutions/${id}`, data);
export const submitSolution = (id) => api.post(`/solutions/${id}/submit`);
export const reviewSolution = (id, data) => api.post(`/solutions/${id}/review`, data);
export const archiveSolution = (id) => api.post(`/solutions/${id}/archive`);
export const getSolutionVersions = (id) => api.get(`/solutions/${id}/versions`);
export const getSolutionProjects = (id) => api.get(`/solutions/${id}/projects`);
