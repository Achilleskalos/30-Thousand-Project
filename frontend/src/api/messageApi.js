import api from './axiosInstance';

export const getInbox = () => api.get('/messages/inbox');
export const getThread = (threadId) => api.get(`/messages/thread/${threadId}`);
export const sendMessage = (data) => api.post('/messages/send', data);
export const getMessageUnreadCount = () => api.get('/messages/unread-count');
