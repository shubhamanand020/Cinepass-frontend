import apiClient from './client';

export const bookingApi = {
  holdSeats: async ({ showId, seatNumbers }) => {
    const response = await apiClient.post('/api/bookings/hold', {
      showId,
      seatNumbers,
    });
    return response.data;
  },

  confirmBooking: async (bookingId) => {
    const response = await apiClient.post(`/api/bookings/${bookingId}/confirm`);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await apiClient.post(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await apiClient.get('/api/bookings');
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await apiClient.get(`/api/bookings/${bookingId}`);
    return response.data;
  },
};

