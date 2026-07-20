'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok');
      return;
    }
    setIsLoading(true);
    const success = await signUp(form.email, form.password, form.name, form.phone);
    setIsLoading(false);
    
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary-50/30 to-background relative overflow-hidden pt-20 pb-10 px-4">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <FadeIn className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-card shadow-soft-xl p-8 md:p-10">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-golden">
                  <span className="text-secondary-900 font-extrabold text-xl">J</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">Buat Akun Baru</h1>
              <p className="text-secondary-500">Daftar untuk memesan lebih mudah</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Masukkan nama" className="input-premium pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="nama@email.com" className="input-premium pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="0812xxxxxxxx" className="input-premium pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Min. 8 karakter" className="input-premium pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input type="password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} placeholder="Ulangi password" className="input-premium pl-10" required />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-secondary-900/30 border-t-secondary-900 rounded-full" />
                ) : (
                  <>Daftar <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-500">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-primary-700 font-semibold hover:text-primary-800">Masuk</Link>
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
