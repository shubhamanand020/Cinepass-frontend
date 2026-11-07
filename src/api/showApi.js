import apiClient from './client';

export const showApi = {
  getShows: async (movieId = null) => {
    const url = movieId ? `/api/shows?movieId=${movieId}` : '/api/shows';
    const response = await apiClient.get(url);
    return response.data;
  },

  getShowById: async (showId) => {
    const response = await apiClient.get(`/api/shows/${showId}`);
    return response.data;
  },

  getSeats: async (showId) => {
    const response = await apiClient.get(`/api/shows/${showId}/seats`);
    return response.data;
  },

  getAvailability: async (showId) => {
    const response = await apiClient.get(`/api/shows/${showId}/availability`);
    return response.data;
  },

  getScreens: async () => {
    const response = await apiClient.get('/api/screens');
    return response.data;
  },

  getScreenById: async (screenId) => {
    const response = await apiClient.get(`/api/screens/${screenId}`);
    return response.data;
  },
};
