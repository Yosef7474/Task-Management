import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchUsers = () => API.get('/users');
export const fetchUser = (id) => API.get(`/users/${id}`);

export default { fetchUsers, fetchUser };
