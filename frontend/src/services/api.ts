import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  registerWorker: (userData: any) => api.post('/auth/register/worker', userData),
  registerEmployer: (employerData: any) => api.post('/auth/register/employer', employerData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Contracts API calls
export const contractsAPI = {
  getContracts: (params: any = {}) => api.get('/contracts', { params }),
  getContract: (contractId: string) => api.get(`/contracts/${contractId}`),
  createContract: (contractData: any) => api.post('/contracts', contractData),
  updateContract: (contractId: string, contractData: any) => api.put(`/contracts/${contractId}`, contractData),
  acceptContract: (contractId: string) => api.post(`/contracts/${contractId}/accept`),
  cancelContract: (contractId: string) => api.post(`/contracts/${contractId}/cancel`),
  searchContracts: (searchParams: any) => api.get('/contracts/search', { params: searchParams }),
};

// Jobs API calls
export const jobsAPI = {
  getJobPosts: (params: any = {}) => api.get('/jobs', { params }),
  getJobPost: (jobId: string) => api.get(`/jobs/${jobId}`),
  createJobPost: (jobData: any) => api.post('/jobs', jobData),
  updateJobPost: (jobId: string, jobData: any) => api.put(`/jobs/${jobId}`, jobData),
  deleteJobPost: (jobId: string) => api.delete(`/jobs/${jobId}`),
  applyToJob: (jobId: string, applicationData: any) => api.post(`/jobs/${jobId}/apply`, applicationData),
  getJobApplications: (jobId: string, params: any = {}) => api.get(`/jobs/${jobId}/applications`, { params }),
  updateApplication: (applicationId: string, updateData: any) => api.put(`/jobs/applications/${applicationId}`, updateData),
};

// Chat API calls
export const chatAPI = {
  sendMessage: (messageData: any) => api.post('/chat/', messageData),
  getMessages: (params: any = {}) => api.get('/chat/', { params }),
  getConversation: (params: any = {}) => api.get('/chat/conversation/', { params }),
  markMessagesRead: (messageIds: string[]) => api.post('/chat/mark-read/', { message_ids: messageIds }),
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export default api;