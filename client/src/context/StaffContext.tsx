import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAssistant } from './AssistantContext';
import axios from 'axios';

interface Staff {
  id: number;
  username: string;
  role: 'admin' | 'staff';
}

interface StaffContextType {
  staff: Staff | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useAssistant();

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('staffToken');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await axios.get('/api/staff/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
    } catch (err) {
      localStorage.removeItem('staffToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/staff/login', {
        username,
        password
      });

      const { token, staff: staffData } = response.data;
      localStorage.setItem('staffToken', token);
      setStaff(staffData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('staffToken');
    setStaff(null);
  };

  const value = {
    staff,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!staff,
    isAdmin: staff?.role === 'admin'
  };

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}; 