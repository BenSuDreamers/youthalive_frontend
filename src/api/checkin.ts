import axios from 'axios';

const API_BASE_URL = 'https://youthalive-backend-873403ae276a.herokuapp.com/api';

const checkinAPI = axios.create({
  baseURL: API_BASE_URL,
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
    const response = await checkinAPI.get('/checkin/search', { params: searchQuery });
    return response.data.data || response.data; // Handle both wrapped and unwrapped responses
  },  scanQR: async (scanData: ScanData): Promise<{ ticket: Attendee; message: string }> => {
    // Transform qrData to the format the backend expects
    const requestData = { invoiceNo: scanData.qrData };
    const response = await checkinAPI.post('/checkin/scan', requestData);
    // Handle backend's structured response
    return {
      ticket: response.data.data || response.data,
      message: response.data.message || 'Check-in successful'
    };
  },
};