'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Phone, Mail, Camera, Save, Loader2 } from 'lucide-react';
import { FadeIn } from '@/components/layout/PageTransition';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: 'Desa Kalirejo, Kec. Kalirejo, Lampung Tengah',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: 'Desa Kalirejo, Kec. Kalirejo, Lampung Tengah',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulasi penyimpanan profil (dapat dihubungkan ke Supabase di masa depan)
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setIsEditing(false);
    toast.success('Profil berhasil diperbarui!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-card shadow-soft">
        <p className="text-secondary-500 mb-4">Silakan login untuk melihat profil Anda.</p>
      </div>
    );
  }

  const userInitials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold text-secondary-900">Profil Saya</h1>
        <p className="text-secondary-500 mt-1">Kelola informasi akun Anda</p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="bg-white rounded-card shadow-soft overflow-hidden">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 p-8 text-center relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/20">
                <span className="text-2xl font-bold text-secondary-900">{userInitials}</span>
              </div>
              <button className="absolute top-14 left-1/2 translate-x-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-secondary-50 transition-colors">
                <Camera className="w-4 h-4 text-secondary-600" />
              </button>
              <h2 className="text-xl font-bold text-white">{form.name || user.name}</h2>
              <p className="text-sm text-white/50 mt-1">Pelanggan terdaftar JSS</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-secondary-900">Informasi Pribadi</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isEditing ? 'text-red-500' : 'text-primary-700 hover:text-primary-800'
                )}
              >
                {isEditing ? 'Batal' : 'Edit'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    disabled={!isEditing}
                    className="input-premium pl-10 disabled:bg-secondary-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    disabled={true}
                    className="input-premium pl-10 disabled:bg-secondary-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    disabled={!isEditing}
                    className="input-premium pl-10 disabled:bg-secondary-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Alamat</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  disabled={!isEditing}
                  className="input-premium disabled:bg-secondary-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4"
              >
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Simpan Perubahan</>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
