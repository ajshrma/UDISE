import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_APP_SERVER_URL || 'http://localhost:5000/api/v1',
  timeout: 10000, // 10 second timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default instance;
