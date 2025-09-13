// API Configuration
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Configure axios defaults
if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
}

export { API_BASE_URL };
