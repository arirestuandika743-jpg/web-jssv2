'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Phone, Star, Plus, Minus, Pencil, Trash2, Loader2, Power, X, Save, UserPlus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { dbService } from '@/services/db';
import type { Driver } from '@/types';
import { toast } from 'sonner';

interface DriverFormData {
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  isActive: boolean;
}

const emptyForm: DriverFormData = { name: '', phone: '', vehicleType: 'Motorcycle', vehiclePlate: '', isActive: true };

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DriverFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  // Custom Delete Confirm Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  const fetchDrivers = () => {
    setLoading(true);
    dbService.getDrivers()
      .then(data => { setDrivers(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchDrivers(); }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (driver: Driver) => {
    setEditingId(driver.id);
    setForm({
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate,
      isActive: driver.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.vehiclePlate.trim()) {
      toast.error('Lengkapi semua field yang wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await dbService.updateDriver(editingId, form);
        toast.success(`Data driver "${form.name}" berhasil diperbarui`);
      } else {
        await dbService.createDriver(form);
        toast.success(`Driver "${form.name}" berhasil ditambahkan`);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchDrivers();
    } catch (err) {
      toast.error('Gagal menyimpan data driver');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (driver: Driver) => {
    setDeleteConfirmId(driver.id);
    setDeleteConfirmName(driver.name);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    setDeletingId(deleteConfirmId);
    const name = deleteConfirmName;
    setDeleteConfirmId(null);
    try {
      await dbService.deleteDriver(deleteConfirmId);
      toast.success(`Driver "${name}" berhasil dihapus`);
      fetchDrivers();
    } catch (err) {
      toast.error('Gagal menghapus driver');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (driver: Driver) => {
    try {
      await dbService.updateDriver(driver.id, { isActive: !driver.isActive });
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, isActive: !d.isActive } : d));
      toast.success(`Status driver ${driver.name} diubah menjadi ${!driver.isActive ? 'Aktif' : 'Offline'}`);
    } catch (err) {
      toast.error('Gagal mengubah status driver');
    }
  };

  const handleRatingChange = async (driver: Driver, delta: number) => {
    const newRating = Math.round((driver.rating + delta) * 10) / 10;
    if (newRating < 1.0 || newRating > 5.0) return;

    setRatingLoading(driver.id);
    try {
      await dbService.updateDriver(driver.id, { rating: newRating });
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, rating: newRating } : d));
      toast.success(`Rating ${driver.name} diubah menjadi ${newRating.toFixed(1)}`);
    } catch (err) {
      toast.error('Gagal mengubah rating driver');
    } finally {
      setRatingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Driver</h1>
            <p className="text-secondary-500 mt-1">Kelola mitra driver — Tambah, Edit, Hapus, Atur Rating</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDrivers} className="btn-outline text-sm py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4" /> Refresh
            </button>
            <button onClick={openAddForm} className="btn-primary text-sm py-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Tambah Driver
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => { setShowForm(false); setEditingId(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100">
                <h2 className="text-lg font-bold text-secondary-900">
                  {editingId ? 'Edit Driver' : 'Tambah Driver Baru'}
                </h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="w-9 h-9 rounded-xl bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Nama Driver *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Agus Setiawan"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Nomor HP *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Jenis Kendaraan</label>
                    <select
                      value={form.vehicleType}
                      onChange={e => setForm({ ...form, vehicleType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    >
                      <option value="Motorcycle">Motor</option>
                      <option value="Car">Mobil</option>
                      <option value="Truck">Pickup/Truk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-1.5">Plat Nomor *</label>
                    <input
                      type="text"
                      value={form.vehiclePlate}
                      onChange={e => setForm({ ...form, vehiclePlate: e.target.value.toUpperCase() })}
                      placeholder="BE 1234 CD"
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-secondary-700">Status:</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-bold transition-all',
                      form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary-100 text-secondary-500'
                    )}
                  >
                    {form.isActive ? '✅ Aktif (Online)' : '⚫ Offline'}
                  </button>
                </div>
              </div>

              <div className="p-5 border-t border-secondary-100 flex items-center gap-3">
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="btn-outline flex-1 py-3 text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Simpan Perubahan' : 'Tambah Driver'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[25%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-secondary-900">Konfirmasi Hapus</h3>
                  <p className="text-sm text-secondary-500 leading-relaxed">
                    Apakah Anda yakin ingin menghapus driver <strong className="text-secondary-900">&quot;{deleteConfirmName}&quot;</strong>? 
                    Tindakan ini permanen dan tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <div className="p-5 border-t border-secondary-100 flex items-center gap-3 bg-secondary-50/50">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-outline flex-1 py-3 text-sm bg-white"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-button flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Driver
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drivers List */}
      <StaggerContainer className="space-y-4">
        {drivers.map((driver) => (
          <StaggerItem key={driver.id}>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-card p-5 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
                    <span className="font-bold text-secondary-900 text-lg">
                      {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
                    driver.isActive ? 'bg-emerald-400' : 'bg-secondary-300'
                  )} />
                </div>
                <div>
                  <p className="font-bold text-secondary-900">{driver.name}</p>
                  <p className="text-sm text-secondary-400">{driver.vehicleType} · {driver.vehiclePlate}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {/* Rating with +/- Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRatingChange(driver, -0.1)}
                        disabled={ratingLoading === driver.id || driver.rating <= 1.0}
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center transition-all',
                          driver.rating <= 1.0
                            ? 'bg-secondary-100 text-secondary-300 cursor-not-allowed'
                            : 'bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600'
                        )}
                        title="Kurangi rating 0.1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-1 min-w-[52px] justify-center">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-xs font-bold text-secondary-700 tabular-nums">
                          {ratingLoading === driver.id ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            driver.rating.toFixed(1)
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRatingChange(driver, 0.1)}
                        disabled={ratingLoading === driver.id || driver.rating >= 5.0}
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center transition-all',
                          driver.rating >= 5.0
                            ? 'bg-secondary-100 text-secondary-300 cursor-not-allowed'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500 hover:text-emerald-600'
                        )}
                        title="Tambah rating 0.1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-secondary-400">{driver.totalDeliveries} pengiriman</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleToggleActive(driver)}
                  className={cn(
                    'badge-status flex items-center gap-1 cursor-pointer transition-all border border-transparent text-xs',
                    driver.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
                  )}
                  title="Klik untuk mengubah status aktif"
                >
                  <Power className="w-3 h-3" />
                  {driver.isActive ? 'Aktif' : 'Offline'}
                </button>
                <button
                  onClick={() => openEditForm(driver)}
                  className="w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                  title="Edit Driver"
                >
                  <Pencil className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => openDeleteConfirm(driver)}
                  disabled={deletingId === driver.id}
                  className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  title="Hapus Driver"
                >
                  {deletingId === driver.id
                    ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                    : <Trash2 className="w-4 h-4 text-red-500" />
                  }
                </button>
                <a
                  href={`tel:${driver.phone}`}
                  className="w-9 h-9 rounded-lg bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors"
                  title="Telepon Driver"
                >
                  <Phone className="w-4 h-4 text-secondary-500" />
                </a>
              </div>
            </motion.div>
          </StaggerItem>
        ))}

        {drivers.length === 0 && (
          <div className="text-center py-16">
            <Truck className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-400 text-sm mb-4">Belum ada driver yang terdaftar.</p>
            <button onClick={openAddForm} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 mx-auto">
              <UserPlus className="w-4 h-4" /> Tambah Driver Pertama
            </button>
          </div>
        )}
      </StaggerContainer>
    </div>
  );
}
