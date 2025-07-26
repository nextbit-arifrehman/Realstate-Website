import axios from 'axios';

// Get the correct backend URL based on environment
const getBackendURL = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('replit.dev')) {
    // For Replit environment, use relative path to leverage Vite proxy
    return '';
  }
  return 'http://localhost:5000';
};

const apiClient = axios.create({
  baseURL: getBackendURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000,
  withCredentials: true
});

// Function to get the JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Add a request interceptor to include the token in the headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    const backendToken = localStorage.getItem('backendToken');
    
    if (backendToken) {
      config.headers.Authorization = `Bearer ${backendToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;