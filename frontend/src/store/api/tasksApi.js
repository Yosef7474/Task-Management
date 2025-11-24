import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchTasks = () => API.get('/tasks');
export const createTask = (task) => API.post('/tasks', task);
export const updateTask = (id, updates) => API.put(`/tasks/${id}`, updates);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export default { fetchTasks, createTask, updateTask, deleteTask };
