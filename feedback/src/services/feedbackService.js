import api from './api';

export const getActiveFeedbacks = () => api.get('/feedback/student/active');
export const getQuestions = (scheduleId) => api.get(`/feedback/questions/${scheduleId}`);
export const submitFeedback = (scheduleId, data) => api.post(`/feedback/${scheduleId}/submit`, data);
export const getReport = (scheduleId) => api.get(`/feedback/reports/${scheduleId}`);
export const scheduleFeedback = (data) => api.post('/feedback/schedule', data);
export const closeFeedback = (scheduleId) => api.put(`/feedback/${scheduleId}/close`);
