import axios from 'axios';

const API_URL = 'http://localhost:5281'; // Actualiza esta URL

const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-type': 'application/json'
    }
});

export default http;