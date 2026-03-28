import axios from 'axios';

// Update this to your deployed backend URL in production
const API_BASE_URL = 'http://180.235.121.253:8099';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
