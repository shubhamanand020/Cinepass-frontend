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

  getAllBookingsAdmin: async () => {
    const response = await apiClient.get('/api/bookings/admin/all');
    return response.data;
  },

  adminCancelBooking: async (bookingId) => {
    const response = await apiClient.post(`/api/bookings/admin/${bookingId}/cancel`);
    return response.data;
  },

  downloadTicketPdf: async (bookingId) => {
    const response = await apiClient.get(`/api/bookings/${bookingId}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cinepass-Ticket-${bookingId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  },

  getTicketQrBlob: async (bookingId) => {
    const response = await apiClient.get(`/api/bookings/${bookingId}/qr`, {
      responseType: 'blob',
    });
    return window.URL.createObjectURL(response.data);
  },

  verifyTicket: async (ticketToken) => {
    const response = await apiClient.post('/api/bookings/verify-ticket', {
      ticketToken,
    });
    return response.data;
  },
};

