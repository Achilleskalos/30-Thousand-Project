import api from './axiosInstance';

export const getOverview = () => api.get('/stats/overview');
export const getCharts = () => api.get('/stats/charts');
