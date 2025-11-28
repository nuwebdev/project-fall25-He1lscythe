import { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  // get {value} from AuthProvider
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = ApiService.getToken();
      const savedUser = ApiService.getSavedUser();
      
      if (token && savedUser) {
        try {
          const { user: currentUser } = await ApiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('API 调用失败:', error);
          ApiService.logout();
        }
      } else {
        console.log('token not exist');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      const data = await ApiService.login(userData);
      ApiService.saveUserData(data.token, data.user);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await ApiService.register(userData);
      ApiService.saveUserData(data.token, data.user);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};