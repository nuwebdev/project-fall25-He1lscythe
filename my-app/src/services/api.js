const API_URL = 'http://localhost:5000/api';

class ApiService {
  // get local token
  static getToken() {
    // Web Storage API , setItem, getItem, removeItem, clear
    return localStorage.getItem('token');
  }

  // path, fetch options
  static async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============ need Auth ============

  static async login(userData) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async getCurrentUser() {
    return this.request('/auth/me');
  }

  static async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  static async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // ============ do not need Auth ============

  static async getGameTypeList() {
    return this.request('/gametype/list', {
      method: 'GET',
    });
  }

  static async getGameTypeDetail(num) {
    return this.request(`/gametype/detail?id=${encodeURIComponent(num)}`, {
      method: 'GET',
    });
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static getSavedUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static saveUserData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default ApiService;