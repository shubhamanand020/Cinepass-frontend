import apiClient from './client';

export const movieApi = {
  getMovies: async () => {
    const response = await apiClient.get('/api/movies');
    return response.data;
  },

  getMovieById: async (id) => {
    const response = await apiClient.get(`/api/movies/${id}`);
    return response.data;
  },
};

