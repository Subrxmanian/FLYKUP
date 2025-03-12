import axios from 'axios';


const apiUrl = 'https://flykup-dev-backend.vercel.app/api';
// const apiUrl = 'http://localhost:6969/api';

const api = axios.create({
    baseURL: apiUrl,
});

export default api;
