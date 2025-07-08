const API_BASE_URL = 'https://webscrapping-uol6.onrender.com/api';

function getToken(token?: string) {
  return token || localStorage.getItem('token') || undefined;
}

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const authToken = getToken(token);
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  },
  
  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const authToken = getToken(token);
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }
    if (!response.ok) {
      throw new Error((result && result.error) || 'Request failed');
    }
    return result;
  },
  
  put: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const authToken = getToken(token);
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }
    return result;
  },
  
  delete: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const authToken = getToken(token);
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }
    return result;
  }
};

// Authentication
export const login = (credentials: { email: string; password: string }) => {
  return apiClient.post('/users/login', credentials);
};

export const register = (userData: { name: string; email: string; password: string }) => {
  return apiClient.post('/users/register', userData);
};

export const getProfile = (token: string) => {
  return apiClient.get('/users/profile', token);
};

// Job endpoints
export const getJobs = (token: string) => {
  return apiClient.get('/jobs', token);
};

export const getJobById = (id: string, token: string) => {
  return apiClient.get(`/jobs/${id}`, token);
};

export const createJob = (jobData: any, token: string) => {
  return apiClient.post('/jobs', jobData, token);
};

export const updateJob = (id: string, jobData: any, token: string) => {
  return apiClient.put(`/jobs/${id}`, jobData, token);
};

export const deleteJob = (id: string, token: string) => {
  return apiClient.delete(`/jobs/${id}`, token);
};

export const runJob = (id: string, token: string) => {
  return apiClient.post(`/jobs/${id}/run`, {}, token);
};

// Reports endpoints
export const getReports = (token: string) => {
  return apiClient.get('/reports', token);
};

export const getJobMetrics = (token: string, timeframe: string = '30') => {
  return apiClient.get(`/reports/metrics?timeframe=${timeframe}`, token);
};

export const getJobDistribution = (token: string) => {
  return apiClient.get('/reports/distribution', token);
};

export const getEnrichmentStats = (token: string) => {
  return apiClient.get('/reports/enrichment-stats', token);
};

export const getJobsTimeSeries = (token: string, timeframe: string = '30', interval: string = 'day') => {
  return apiClient.get(`/reports/time-series?timeframe=${timeframe}&interval=${interval}`, token);
};

export const getRecentJobs = (token: string, limit: number = 10) => {
  return apiClient.get(`/reports/recent-jobs?limit=${limit}`, token);
};
