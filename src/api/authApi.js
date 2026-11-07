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

  getMyProfile: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },

  updateMyProfile: async (profileData) => {
    const response = await apiClient.put('/api/users/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put('/api/users/profile/change-password', passwordData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },
};

