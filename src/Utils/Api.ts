import axios from 'axios';


// const apiUrl = 'http://localhost:6969/api';
const apiUrl = 'https://flykup-dev-backend.vercel.app/api';
// const apiUrl = 'https://flykup-backend-hjf4cjgee6bjd4b9.eastasia-01.azurewebsites.net/api';

const api = axios.create({
    baseURL: apiUrl,
});

export default api;
