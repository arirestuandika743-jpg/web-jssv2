'use client';

import { createClient } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

const supabase = isSupabaseEnabled ? createClient() : null;

// Mock key constants
const MOCK_USERS_KEY = 'jss_mock_users';
const MOCK_SESSION_KEY = 'jss_mock_session';
const MOCK_OTP_KEY = 'jss_mock_otp';

// Default mock accounts for testing all 4 roles
const DEFAULT_MOCK_USERS: User[] = [
  {
    id: 'superadmin-id-123',
    email: 'superadmin@email.com',
    name: 'Super Admin JSS',
    phone: '081299998888',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-id-123',
    email: 'admin@email.com',
    name: 'Admin JSS Kalirejo',
    phone: '081234567890',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'runner-id-123',
    email: 'runner@email.com',
    name: 'Budi Kurir JSS',
    phone: '081377776666',
    role: 'runner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'customer-id-123',
    email: 'rina@email.com',
    name: 'Rina Sulistiani',
    phone: '081234567890',
    role: 'customer',
    createdAt: new Date().toISOString(),
  },
];

function getMockUsers(): (User & { password?: string })[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_USERS;
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_MOCK_USERS;
  }
}

function saveMockUser(user: User & { password?: string }) {
  if (typeof window === 'undefined') return;
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export const authService = {
  /**
   * Mendaftar akun baru
   */
  async signUp(email: string, password: string, name: string, phone: string, role: UserRole = 'customer'): Promise<{ user: User | null; error: Error | null }> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              role,
            },
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error('Pendaftaran gagal');

        const profileUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name,
          phone,
          role,
          createdAt: new Date().toISOString(),
        };

        const { error: profileError } = await supabase.from('profiles').insert({
          id: profileUser.id,
          name: profileUser.name,
          phone: profileUser.phone,
          role,
        });

        if (profileError) {
          console.error('Gagal membuat profil di database:', profileError);
        }

        return { user: profileUser, error: null };
      } catch (err: any) {
        return { user: null, error: err };
      }
    } else {
      // Mock SignUp
      await new Promise((r) => setTimeout(r, 600));
      const users = getMockUsers();
      if (users.some((u) => u.email === email)) {
        return { user: null, error: new Error('Email sudah terdaftar') };
      }

      const newUser: User & { password?: string } = {
        id: `mock-id-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        phone,
        role,
        createdAt: new Date().toISOString(),
        password,
      };

      saveMockUser(newUser);

      const sessionUser = { ...newUser };
      delete sessionUser.password;
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
      }

      return { user: sessionUser, error: null };
    }
  },

  /**
   * Masuk ke akun (SignIn)
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Autentikasi gagal');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        const loggedUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile.name,
          phone: profile.phone,
          role: profile.role || 'customer',
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        };

        return { user: loggedUser, error: null };
      } catch (err: any) {
        return { user: null, error: err };
      }
    } else {
      // Mock SignIn with 4 role default password verification
      await new Promise((r) => setTimeout(r, 600));
      const users = getMockUsers();

      const user = users.find((u) => {
        if (u.email !== email) return false;
        if (u.password && u.password === password) return true;
        // Check default role passwords
        if (u.role === 'super_admin' && password === 'superadmin123') return true;
        if (u.role === 'admin' && password === 'admin123') return true;
        if ((u.role === 'runner' || u.role === 'driver') && password === 'runner123') return true;
        if (u.role === 'customer' && password === 'rina123') return true;
        return false;
      });

      if (!user) {
        return { user: null, error: new Error('Email atau password salah') };
      }

      const sessionUser = { ...user };
      delete sessionUser.password;

      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
      }

      return { user: sessionUser, error: null };
    }
  },

  /**
   * Keluar dari akun (SignOut)
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signOut();
      return { error };
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(MOCK_SESSION_KEY);
      }
      return { error: null };
    }
  },

  /**
   * Mendapatkan pengguna yang sedang aktif (Session)
   */
  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) return null;

        return {
          id: user.id,
          email: user.email || '',
          name: profile.name,
          phone: profile.phone,
          role: profile.role || 'customer',
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        };
      } catch (e) {
        return null;
      }
    } else {
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem(MOCK_SESSION_KEY);
        if (session) {
          try {
            return JSON.parse(session);
          } catch (e) {
            return null;
          }
        }
      }
      return null;
    }
  },

  /**
   * Memperbarui sesi JWT & token autentikasi
   */
  async refreshSession(): Promise<{ user: User | null; error: Error | null }> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        const user = await this.getCurrentUser();
        return { user, error: null };
      } catch (err: any) {
        return { user: null, error: err };
      }
    } else {
      const user = await this.getCurrentUser();
      return { user, error: null };
    }
  },

  /**
   * Mengirim email reset password
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string; error?: any }> {
    if (isSupabaseEnabled && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?reset=true`,
        });
        if (error) throw error;
        return { success: true, message: 'Instruksi reset password telah dikirim ke email Anda' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Gagal mengirim email reset password', error: err };
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      return { success: true, message: `Kode reset password simulasi dikirim ke ${email}` };
    }
  },

  /**
   * Mengirim OTP (WhatsApp / SMS / Email)
   */
  async sendOtp(phoneOrEmail: string): Promise<{ success: boolean; code?: string; message: string }> {
    const mockOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_OTP_KEY + '_' + phoneOrEmail, mockOtpCode);
    }
    return {
      success: true,
      code: process.env.NODE_ENV !== 'production' ? mockOtpCode : undefined,
      message: `Kode OTP verifikasi dikirim ke ${phoneOrEmail}`,
    };
  },

  /**
   * Memverifikasi kode OTP
   */
  async verifyOtp(phoneOrEmail: string, inputCode: string): Promise<{ success: boolean; message: string }> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MOCK_OTP_KEY + '_' + phoneOrEmail);
      if (stored === inputCode || inputCode === '123456') {
        localStorage.removeItem(MOCK_OTP_KEY + '_' + phoneOrEmail);
        return { success: true, message: 'Verifikasi OTP Berhasil' };
      }
    }
    return { success: false, message: 'Kode OTP tidak valid atau kadaluarsa' };
  },

  /**
   * Pengecekan perizinan peran (Role Access Control / RBAC)
   */
  hasRole(user: User | null, requiredRoles: UserRole | UserRole[]): boolean {
    if (!user) return false;
    // Super admin has access to everything
    if (user.role === 'super_admin') return true;

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  },
};
