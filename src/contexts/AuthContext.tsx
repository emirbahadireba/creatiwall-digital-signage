import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  preferences?: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: string;
  branding?: {
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyDomain?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || (
    import.meta.env.MODE === 'production'
      ? '/api'
      : 'http://localhost:3001/api'
  );

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        const storedTenant = localStorage.getItem('auth_tenant');

        if (storedToken && storedUser && storedTenant &&
            storedUser !== 'undefined' && storedTenant !== 'undefined') {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setTenant(JSON.parse(storedTenant));

            // Try to verify token, but don't logout if it fails
            // This allows offline usage and handles network issues gracefully
            verifyToken(storedToken).catch(error => {
              console.warn('Token verification failed during initialization, but keeping session:', error);
            });
          } catch (parseError) {
            console.error('JSON parse error in auth initialization:', parseError);
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Token verification failed, but keeping existing session');
        // Don't throw error - keep existing session data
        return false;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
        setTenant(data.data.tenant);
        
        // Update localStorage with fresh data
        localStorage.setItem('auth_user', JSON.stringify(data.data.user));
        localStorage.setItem('auth_tenant', JSON.stringify(data.data.tenant));
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Token verification network error, keeping existing session:', error);
      // Don't throw error on network issues - keep existing session
      return false;
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tenant');
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }

      if (data.success) {
        const { token: newToken, user: userData, tenant: tenantData } = data.data;
        
        setToken(newToken);
        setUser(userData);
        setTenant(tenantData);

        // Store in localStorage
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_tenant', JSON.stringify(tenantData));
      } else {
        throw new Error(data.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }

      if (data.success) {
        const { token: newToken, user: newUser, tenant: newTenant } = data.data;
        
        setToken(newToken);
        setUser(newUser);
        setTenant(newTenant);

        // Store in localStorage
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        localStorage.setItem('auth_tenant', JSON.stringify(newTenant));
      } else {
        throw new Error(data.message || 'Kayıt başarısız');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Call logout endpoint to invalidate session
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const refreshToken = async () => {
    try {
      if (!token) {
        throw new Error('No token to refresh');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token yenileme başarısız');
      }

      if (data.success) {
        const newToken = data.data.token;
        setToken(newToken);
        localStorage.setItem('auth_token', newToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tenant,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};