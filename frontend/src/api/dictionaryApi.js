import api from './axiosInstance';

export const getDictionaries = (params) => api.get('/dictionaries', { params });
export const getDictionaryByCategory = (category) => api.get(`/dictionaries/${category}`);
export const createDictionary = (data) => api.post('/dictionaries', data);
export const updateDictionary = (id, data) => api.patch(`/dictionaries/${id}`, data);
export const deleteDictionary = (id) => api.delete(`/dictionaries/${id}`);
