/**
 * API Client Configuration
 * 
 * Configures the Axios instance for making HTTP requests to the backend API.
 * Sets the base URL and default headers.
 */

import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
    // Base URL for the API (ensure this matches your backend server address)
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
