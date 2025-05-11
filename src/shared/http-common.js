import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Actualiza esta URL

const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-type': 'application/json'
    }
});

http.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default http;