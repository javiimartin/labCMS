import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutos de inactividad
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutos antes de la expiración

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);

    // Determinar si es un admin o un estudiante
    if (decoded.isAdmin) {
      setAdmin(decoded);
    } else {
      setUser(decoded);
    }
    
    setLastActiveTime(Date.now());
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setAdmin(null);
    navigate('/login');
  }, [navigate]);

  const refreshAuthToken = useCallback(async (currentToken) => {
    try {
      const decoded = jwtDecode(currentToken);
      const currentTime = Date.now();

      if (decoded.exp * 1000 - currentTime <= TOKEN_REFRESH_THRESHOLD) {
        const refreshedToken = await fetchNewToken(currentToken);

        if (refreshedToken) {
          localStorage.setItem('token', refreshedToken);
          const newDecoded = jwtDecode(refreshedToken);

          if (newDecoded.isAdmin) {
            setAdmin(newDecoded);
          } else {
            setUser(newDecoded);
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          if (decoded.isAdmin) {
            setAdmin(decoded);
          } else {
            setUser(decoded);
          }
          refreshAuthToken(token);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [refreshAuthToken]);

  useEffect(() => {
    const handleInactivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastActiveTime > INACTIVITY_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(handleInactivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastActiveTime, logout]);

  useEffect(() => {
    const handleActivity = () => setLastActiveTime(Date.now());
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, []);

  const fetchNewToken = async (currentToken) => {
    try {
      const response = await fetch('/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.newToken;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching new token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
