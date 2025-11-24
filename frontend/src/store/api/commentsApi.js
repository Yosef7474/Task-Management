import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchComments = (taskId) => API.get(`/tasks/${taskId}/comments`);
export const addComment = (taskId, payload) => API.post(`/tasks/${taskId}/comments`, payload);

export default { fetchComments, addComment };
