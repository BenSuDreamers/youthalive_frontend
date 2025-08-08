import axios from 'axios';

const API_BASE_URL = 'https://youthalive-backend-873403ae276a.herokuapp.com/api';

const checkinAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for high-load scenarios
});

// Add retry interceptor for failed requests
checkinAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry logic for network errors or 5xx errors
    if (
      !config._retry && 
      (error.code === 'ECONNABORTED' || 
       error.code === 'NETWORK_ERROR' ||
       (error.response && error.response.status >= 500))
    ) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= 3) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, config._retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkinAPI(config);
      }
    }
    
    return Promise.reject(error);
  }
);

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
  phone?: string;
  church?: string;
  quantity?: number;
  productDetails?: string;
  totalAmount?: number;
  checkedIn: boolean;
  checkInTime?: string;
  event?: string;
}

export interface SearchQuery {
  query: string;
  eventId?: string;
}

export interface ScanData {
  qrData: string;
  eventId?: string; // Add eventId to ensure QR scans are for specific event
}

export const checkinService = {
  searchAttendees: async (searchQuery: SearchQuery): Promise<Attendee[]> => {
    const response = await checkinAPI.get('/checkin/search', { params: searchQuery });
    return response.data.data || response.data; // Handle both wrapped and unwrapped responses
  },

  lookupTicket: async (invoiceNo: string, eventId?: string): Promise<Attendee> => {
    const requestData: any = { invoiceNo };
    if (eventId) {
      requestData.eventId = eventId;
    }
    const response = await checkinAPI.post('/checkin/lookup', requestData);
    return response.data.data || response.data;
  },

  scanQR: async (scanData: ScanData & { eventId?: string }): Promise<{ ticket: Attendee; message: string }> => {
    // Transform qrData to the format the backend expects
    const requestData: any = { invoiceNo: scanData.qrData };
    if (scanData.eventId) {
      requestData.eventId = scanData.eventId;
    }
    const response = await checkinAPI.post('/checkin/scan', requestData);
    // Handle backend's structured response
    return {
      ticket: response.data.data || response.data,
      message: response.data.message || 'Check-in successful'
    };
  },
};