import api from './axiosInstance';

export const getAttachments = (entityType, entityId) => api.get(`/attachments/${entityType}/${entityId}`);
export const uploadAttachment = (entityType, entityId, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/attachments/${entityType}/${entityId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);
