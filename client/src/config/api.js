// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
import axios from 'axios';

if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
}

export { API_BASE_URL };
