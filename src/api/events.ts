import axios from 'axios';

const API_BASE_URL = 'https://youthalive-backend-873403ae276a.herokuapp.com/api';

const eventsAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
eventsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Event {
  _id: string;
  formId: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export const eventsService = {
  getEvents: async (): Promise<Event[]> => {
    const response = await eventsAPI.get('/events');
    return response.data.data || response.data; // Handle both wrapped and unwrapped responses
  },
};