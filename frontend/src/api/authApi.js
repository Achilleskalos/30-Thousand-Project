import api from './axiosInstance';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) => api.patch('/auth/change-password', data);
