import axios from 'axios'

const API = axios.create({ baseURL: '/api' });

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (data) => API.post('/auth/register', data);

export default { login, register };
