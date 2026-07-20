'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import type { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, phone: string, role?: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  sendOtp: (phoneOrEmail: string) => Promise<{ success: boolean; code?: string; message: string }>;
  verifyOtp: (phoneOrEmail: string, code: string) => Promise<{ success: boolean; message: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error('Error refreshing session:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const { user: loggedUser, error } = await authService.signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Gagal masuk');
      return false;
    }

    setUser(loggedUser);
    toast.success(`Selamat datang kembali, ${loggedUser?.name}!`);
    return true;
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    phone: string, 
    role: UserRole = 'customer'
  ): Promise<boolean> => {
    setLoading(true);
    const { user: newUser, error } = await authService.signUp(email, password, name, phone, role);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Pendaftaran gagal');
      return false;
    }

    setUser(newUser);
    toast.success('Pendaftaran berhasil! Akun Anda siap digunakan.');
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await authService.signOut();
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Gagal keluar');
      return;
    }

    setUser(null);
    toast.success('Berhasil keluar akun');
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    return authService.hasRole(user, requiredRoles);
  };

  const sendOtp = async (phoneOrEmail: string) => {
    return authService.sendOtp(phoneOrEmail);
  };

  const verifyOtp = async (phoneOrEmail: string, code: string) => {
    return authService.verifyOtp(phoneOrEmail, code);
  };

  const sendPasswordResetEmail = async (email: string) => {
    return authService.sendPasswordResetEmail(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        hasRole,
        sendOtp,
        verifyOtp,
        sendPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
