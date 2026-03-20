import api from './axiosInstance';

export const getOrganizations = (params) => api.get('/organizations', { params });
export const getOrganizationById = (id) => api.get(`/organizations/${id}`);
export const createOrganization = (data) => api.post('/organizations', data);
export const updateOrganization = (id, data) => api.patch(`/organizations/${id}`, data);
export const createDepartment = (orgId, data) => api.post(`/organizations/${orgId}/departments`, data);
export const updateDepartment = (orgId, deptId, data) => api.patch(`/organizations/${orgId}/departments/${deptId}`, data);
