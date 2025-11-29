// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    auth: `${API_URL}/api/auth`,
    books: `${API_URL}/api/books`,
    stickers: `${API_URL}/api/stickers`,
};
