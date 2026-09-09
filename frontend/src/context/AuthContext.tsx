import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campuspulse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Default to student demo user for instant testability
    return MOCK_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('campuspulse_user', JSON.stringify(user));
      localStorage.setItem('token', `mock-jwt-token-${user.id}`);
    } else {
      localStorage.removeItem('campuspulse_user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      showToast('Logged In Successfully', `Welcome back, ${found.name}!`, 'success');
      return true;
    }
    // Auto-create student account if unrecognized
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    showToast('Demo Account Created', `Signed in as ${newUser.name}`, 'success');
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  const switchRoleDemo = (targetRole: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === targetRole) || {
      id: `u-${targetRole}`,
      name: `Demo ${targetRole}`,
      email: `${targetRole}@campuspulse.edu`,
      role: targetRole,
      createdAt: new Date().toISOString(),
    };
    setUser(targetUser);
    showToast('Role Switched', `Active role switched to: ${targetRole.toUpperCase()}`, 'info');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    showToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user,
        login,
        logout,
        switchRoleDemo,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
