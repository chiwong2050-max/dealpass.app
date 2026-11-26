import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  userTier: string;
  creditBalance: number;
  referralCode?: string;
  city?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback((userData: User, jwtToken: string) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    toast.success('Authentication successful!');
    navigate('/'); // Redirect to home or dashboard after successful auth
  }, [navigate]);

  const loadUser = useCallback(async () => {
    // Only attempt to load if we have a token or to check valid session
    if (token || localStorage.getItem('token')) {
        const currentToken = token || localStorage.getItem('token');
        if (currentToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
             try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);
                // Also ensure token state is synced if it came from localStorage
                if (!token) setToken(currentToken);
              } catch (error) {
                console.error('Failed to fetch user data:', error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                delete api.defaults.headers.common['Authorization'];
              }
        }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      handleAuthSuccess(response.data.user, response.data.token);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  const signup = useCallback(async (email: string, password: string, name?: string, referralCode?: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { email, password, name, referralCode });
      handleAuthSuccess(response.data.user, response.data.token);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  const loginWithToken = useCallback(async (magicToken: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/magic-login', { token: magicToken });
      handleAuthSuccess(response.data.user, response.data.token);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'This sign-in link is invalid or has expired.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    toast.info('You have been logged out.');
    navigate('/login'); // Redirect to login page after logout
  }, [navigate]);

  const authContextValue = React.useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user,
    login,
    loginWithToken,
    signup,
    logout,
    loading,
    loadUser,
  }), [user, token, login, loginWithToken, signup, logout, loading, loadUser]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};