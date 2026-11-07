import apiClient from './client';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data; // { token, userId, email }
  },

  register: async (userData) => {
    const response = await apiClient.post('/api/users', userData);
    return response.data; // { id, name, email, createdAt, updatedAt }
  },

  getUserProfile: async (userId) => {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },
};

