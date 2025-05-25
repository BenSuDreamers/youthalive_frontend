import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const checkinAPI = axios.create({
  baseURL: `${API_BASE_URL}/checkin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
checkinAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Attendee {
  _id: string;
  invoiceNumber: string;
  user: string;
  event: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  attendeeChurch: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface SearchQuery {
  query: string;
  eventId?: string;
}

export interface ScanData {
  qrData: string;
}

export const checkinService = {
  searchAttendees: async (searchQuery: SearchQuery): Promise<Attendee[]> => {
    const response = await checkinAPI.get('/search', { params: searchQuery });
    return response.data;
  },

  scanQR: async (scanData: ScanData): Promise<{ ticket: Attendee; message: string }> => {
    const response = await checkinAPI.post('/scan', scanData);
    return response.data;
  },
};