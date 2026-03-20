import api from './axiosInstance';

export const getProjects = (params) => api.get('/projects', { params });
export const getMyProjects = (params) => api.get('/projects/my', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data);
export const addExpertToProject = (id, data) => api.post(`/projects/${id}/experts`, data);
export const removeExpertFromProject = (id, expertId) => api.delete(`/projects/${id}/experts/${expertId}`);
export const updateProgress = (id, data) => api.patch(`/projects/${id}/progress`, data);
export const getProjectSolutions = (id) => api.get(`/projects/${id}/solutions`);
export const linkSolutionToProject = (id, data) => api.post(`/projects/${id}/solutions`, data);
export const unlinkSolutionFromProject = (id, solutionId) => api.delete(`/projects/${id}/solutions/${solutionId}`);

export const getMilestones = (id) => api.get(`/projects/${id}/milestones`);
export const createMilestone = (id, data) => api.post(`/projects/${id}/milestones`, data);
export const updateMilestone = (id, mid, data) => api.patch(`/projects/${id}/milestones/${mid}`, data);
export const deleteMilestone = (id, mid) => api.delete(`/projects/${id}/milestones/${mid}`);

export const getDeliverables = (id) => api.get(`/projects/${id}/deliverables`);
export const createDeliverable = (id, data) => api.post(`/projects/${id}/deliverables`, data);
export const submitDeliverable = (id, did) => api.post(`/projects/${id}/deliverables/${did}/submit`);
export const reviewDeliverable = (id, did, data) => api.post(`/projects/${id}/deliverables/${did}/review`, data);
export const deleteDeliverable = (id, did) => api.delete(`/projects/${id}/deliverables/${did}`);

export const getProjectRecommendations = (id) => api.get(`/projects/${id}/recommendations`);
