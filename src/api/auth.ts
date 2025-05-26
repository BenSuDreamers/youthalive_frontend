import axios from 'axios';

const API_BASE_URL = 'https://youthalive-backend-873403ae276a.herokuapp.com/api';

// Debug log to see what URL is being used
console.log('Auth API_BASE_URL:', API_BASE_URL);

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  registrationSecret: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface User {
  _id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authAPI.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authAPI.post('/auth/register', data);
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await authAPI.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await authAPI.post('/auth/reset-password', data);
    return response.data;
  },
};