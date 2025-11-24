import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchActivities = () => API.get('/activities');

export default { fetchActivities };
