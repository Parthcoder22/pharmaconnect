/**
 * Centralized API Client for PharmaConnect
 * Handles base URL, auth token injection, error handling, and robust network fallback
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('pharmaconnect_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('pharmaconnect_token', token);
    } else {
      localStorage.removeItem('pharmaconnect_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('pharmaconnect_token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.message || (data.errors && data.errors[0]?.message) || `HTTP error ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.errors = data.errors || [];
        throw error;
      }

      return data;
    } catch (err) {
      // Log error and rethrow for component or service level handling
      console.warn(`[API Client] ${options.method || 'GET'} ${url} error:`, err.message);
      throw err;
    }
  }

  get(endpoint, query = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
