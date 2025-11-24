import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchAttachments = (taskId) => API.get(`/tasks/${taskId}/attachments`);
export const uploadAttachment = (taskId, formData) => API.post(`/tasks/${taskId}/attachments`, formData);

export default { fetchAttachments, uploadAttachment };
