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
  id: string;
  invoiceNo: string;
  name: string;
  email: string;
  checkedIn: boolean;
  checkInTime?: string;
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
    return response.data.data || response.data; // Handle both wrapped and unwrapped responses
  },  scanQR: async (scanData: ScanData): Promise<{ ticket: Attendee; message: string }> => {
    // Transform qrData to the format the backend expects
    const requestData = { invoiceNo: scanData.qrData };
    const response = await checkinAPI.post('/scan', requestData);
    // Handle backend's structured response
    return {
      ticket: response.data.data || response.data,
      message: response.data.message || 'Check-in successful'
    };
  },
};