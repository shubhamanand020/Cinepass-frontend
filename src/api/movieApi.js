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

  createMovie: async (movieData) => {
    const response = await apiClient.post('/api/movies', movieData);
    return response.data;
  },

  updateMovie: async (id, movieData) => {
    const response = await apiClient.put(`/api/movies/${id}`, movieData);
    return response.data;
  },

  deleteMovie: async (id) => {
    const response = await apiClient.delete(`/api/movies/${id}`);
    return response.data;
  },
};

