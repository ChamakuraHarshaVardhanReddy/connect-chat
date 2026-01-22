const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  logout: async () => {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Rooms API
export const roomsAPI = {
  getAll: async () => {
    return apiRequest('/rooms');
  },

  getById: async (id: string) => {
    return apiRequest(`/rooms/${id}`);
  },

  create: async (name: string, description?: string, type?: string) => {
    return apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description, type }),
    });
  },

  join: async (id: string) => {
    return apiRequest(`/rooms/${id}/join`, {
      method: 'POST',
    });
  },
};

// Messages API
export const messagesAPI = {
  getRoomMessages: async (roomId: string, page = 1, limit = 50) => {
    return apiRequest(`/messages/room/${roomId}?page=${page}&limit=${limit}`);
  },

  getDirectMessages: async (dmId: string, page = 1, limit = 50) => {
    return apiRequest(`/messages/dm/${dmId}?page=${page}&limit=${limit}`);
  },
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },
};

// Users API (for getting user list for DMs)
export const usersAPI = {
  getAll: async () => {
    return apiRequest('/users');
  },
};
