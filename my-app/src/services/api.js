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

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ============ /api/gametype/* ============

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

  // ============ /api/gamesession/* ============

  static async uploadGameSession(gameData) {
    console.log('gamedata', gameData);
    return this.request('/gamesession/upload', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  }

  // app.get('api/gamesession/detail'
  static async getGameSessionDetail(f = {}) {
    const s = new URLSearchParams(f);
    return this.request(`/gamesession/detail${s ? `?${s}` : ''}`, {
      method: 'GET',
    });
  }

  // ============ /api/user/* ============

  //GET ?userId=xxx&page=1&limit=100&from=2023-01-01&to=2025-11-30
  static async getGameSession(f = {}) {
    const s = new URLSearchParams(
      Object.fromEntries(
        Object.entries(f).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );
    return this.request(`/user/gamesession${s ? `?${s}` : ''}`, {
      method: 'GET',
    });
  }

  static async getRoundPlayers(f = {}) {
    const s = new URLSearchParams(
      Object.fromEntries(
        Object.entries(f).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );
    
    return this.request(`/user/roundplayers${s ? `?${s}` : ''}`, {
      method: 'GET',
    });
  }

  static async getDataGrid(id) {
    return this.request(`/user/datagrid/${id}`, {
      method: 'GET',
    });
  }

  // app.get('/api/user/search',
  static async searchUser(q, id = null) {
    const s = new URLSearchParams({ q });
    if (id) s.append('id', id);
    return this.request(`/user/search?${s}`, {
      method: 'GET',
    });
  }

  static async getUserById(id) {
    return this.request(`/user/${id}`, {
      method: 'GET',
    });
  }

  static async comparePoints(f = {}) {
    const s = new URLSearchParams(
      Object.fromEntries(
        Object.entries(f).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    );
    return this.request(`/user/comparepoints${s ? `?${s}` : ''}`, {
      method: 'GET',
    });
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

  // ============ Admin ============

  static async adminGetUsers() {
    return this.request('/admin/users', {
      method: 'GET',
    });
  }

  static async adminUpdateUserStatus(userId, status) {
    return this.request(`/admin/user/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  static async adminDeleteGameSession(uuid) {
    return this.request(`/admin/gamesession/${uuid}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;