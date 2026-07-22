import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            (window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000/api') + '/auth/token/refresh/',
            { refresh: refreshToken }
          );

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  verifyEmail: (token) => api.post('/auth/verify-email/', { token }),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh_token: refreshToken }),
  getCurrentUser: () => api.get('/auth/me/'),
  updateProfile: (profileData) => api.put('/auth/profile/', profileData),
  requestPasswordReset: (email) => api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (data) => api.post('/auth/password-reset-confirm/', data),
};

// Event API calls
export const eventAPI = {
  list: (params) => api.get('/events/', { params }),
  create: (eventData) => api.post('/events/', eventData),
  get: (id) => api.get(`/events/${id}/`),
  update: (id, eventData) => api.put(`/events/${id}/`, eventData),
  delete: (id) => api.delete(`/events/${id}/`),
  join: (id) => api.post(`/events/${id}/join/`),
  leave: (id) => api.post(`/events/${id}/leave/`),
  comments: {
    list: (eventId) => api.get(`/events/${eventId}/comments/`),
    create: (eventId, commentData) => api.post(`/events/${eventId}/comments/`, commentData),
    update: (commentId, commentData) => api.put(`/events/comments/${commentId}/`, commentData),
    delete: (commentId) => api.delete(`/events/comments/${commentId}/`),
  },
};

// Chat API calls
export const chatAPI = {
  rooms: {
    list: () => api.get('/chat/rooms/'),
    create: (roomData) => api.post('/chat/rooms/', roomData),
    get: (id) => api.get(`/chat/rooms/${id}/`),
  },
  messages: {
    list: (roomId) => api.get(`/chat/rooms/${roomId}/messages/`),
    create: (roomId, messageData) => api.post(`/chat/rooms/${roomId}/messages/`, messageData),
  },
  participants: {
    available: (roomId) => api.get(`/chat/rooms/${roomId}/participants/available/`),
    add: (roomId, userIds) => api.post(`/chat/rooms/${roomId}/participants/add/`, { user_ids: userIds }),
    remove: (roomId, userId) => api.post(`/chat/rooms/${roomId}/participants/remove/`, userId ? { user_id: userId } : {}),
  },
  typing: {
    set: (roomId, isTyping) => api.post(`/chat/rooms/${roomId}/typing/`, { is_typing: isTyping }),
    get: (roomId) => api.get(`/chat/rooms/${roomId}/typing/`),
  },
  createDirectChat: (userId) => api.post('/chat/direct/', { user_id: userId }),
  markRead: (roomId) => api.post(`/chat/rooms/${roomId}/mark-read/`),
};

// News API calls
export const newsAPI = {
  list: (params) => api.get('/news/', { params }),
  create: (newsData) => api.post('/news/', newsData),
  get: (id) => api.get(`/news/${id}/`),
  update: (id, newsData) => api.put(`/news/${id}/`, newsData),
  delete: (id) => api.delete(`/news/${id}/`),
};

// User API calls
export const userAPI = {
  list: (params) => api.get('/users/', { params }),
  get: (id) => api.get(`/users/${id}/`),
};

// Recommendations API calls
export const recommendationsAPI = {
  getRecommendedEvents: (limit = 10) => api.get(`/recommendations/events/?limit=${limit}`),
  getSimilarEvents: (eventId, limit = 5) => api.get(`/recommendations/events/${eventId}/similar/?limit=${limit}`),
};

export default api;
