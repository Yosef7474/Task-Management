import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchNotifications = () => API.get('/notifications');
export const markRead = (id) => API.post(`/notifications/${id}/read`);

export default { fetchNotifications, markRead };
