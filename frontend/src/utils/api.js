const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
};

// Remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error('API Error:', error);
      throw new Error(error.error || error.detail || 'Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', endpoint, error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  login: (username, password) =>
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username, email, password, full_name) =>
    apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name }),
    }),

  logout: (refresh_token) =>
    apiRequest('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions/${queryString ? '?' + queryString : ''}`);
  },

  create: (data) =>
    apiRequest('/transactions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/transactions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/transactions/${id}/`, {
      method: 'DELETE',
    }),
};

// Category APIs
export const categoryAPI = {
  getAll: () => apiRequest('/categories/'),

  create: (data) =>
    apiRequest('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Budget APIs
export const budgetAPI = {
  getAll: () => apiRequest('/budgets/'),

  create: (data) =>
    apiRequest('/budgets/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/budgets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard-stats/'),
  getQuickStats: () => apiRequest('/quick-stats/'),
};

// CSV Upload APIs
export const csvAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/csv/upload/', {
      method: 'POST',
      body: formData,
    });
  },

  confirmImport: (transactions) =>
    apiRequest('/csv/confirm/', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    }),
};
