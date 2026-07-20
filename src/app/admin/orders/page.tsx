'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  UserPlus,
  Package,
  MoreHorizontal,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDistance, cn } from '@/lib/utils';
import { FadeIn } from '@/components/layout/PageTransition';
import { dbService } from '@/services/db';
import type { Order, Driver, OrderStatus } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; class: string; actions: string[] }> = {
  waiting: { label: 'Menunggu', class: 'badge-pending', actions: ['accept', 'reject'] },
  accepted: { label: 'Diterima', class: 'badge-active', actions: ['assign_driver'] },
  driver_going: { label: 'Driver Menuju', class: 'bg-indigo-100 text-indigo-700 badge-status', actions: ['on_process'] },
  shopping: { label: 'Belanja', class: 'bg-purple-100 text-purple-700 badge-status', actions: ['on_process'] },
  delivering: { label: 'Diantar', class: 'bg-cyan-100 text-cyan-700 badge-status', actions: ['on_process'] },
  completed: { label: 'Selesai', class: 'badge-completed', actions: [] },
  cancelled: { label: 'Batal', class: 'badge-cancelled', actions: [] },
};

const filterOptions = ['Semua', 'Menunggu', 'Diterima', 'Proses', 'Selesai', 'Batal'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([
      dbService.getAllOrders(),
      dbService.getDrivers()
    ]).then(([ordersResult, driversResult]) => {
      setOrders(ordersResult);
      setDrivers(driversResult);
    }).catch(err => {
      console.error('Gagal mengambil data:', err);
      toast.error('Gagal memuat pesanan');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const success = await dbService.updateOrderStatus(orderId, nextStatus);
      if (success) {
        toast.success(`Status pesanan berhasil diubah menjadi ${nextStatus.toUpperCase()}`);
        fetchAllData();
      }
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const success = await dbService.assignDriver(orderId, driverId);
      if (success) {
        toast.success('Driver berhasil ditugaskan ke pesanan!');
        setAssigningOrder(null);
        fetchAllData();
      }
    } catch (err) {
      toast.error('Gagal menugaskan driver');
    }
  };

  const handleCycleStatus = async (order: Order) => {
    const statusSequence: OrderStatus[] = ['waiting', 'accepted', 'driver_going', 'shopping', 'delivering', 'completed'];
    const currentIndex = statusSequence.indexOf(order.status);
    if (currentIndex !== -1 && currentIndex < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentIndex + 1];
      await handleUpdateStatus(order.id, nextStatus);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'Semua') return matchSearch;
    if (activeFilter === 'Menunggu') return matchSearch && order.status === 'waiting';
    if (activeFilter === 'Diterima') return matchSearch && order.status === 'accepted';
    if (activeFilter === 'Proses') return matchSearch && ['driver_going', 'shopping', 'delivering'].includes(order.status);
    if (activeFilter === 'Selesai') return matchSearch && order.status === 'completed';
    if (activeFilter === 'Batal') return matchSearch && order.status === 'cancelled';
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Manajemen Pesanan</h1>
            <p className="text-secondary-500 mt-1">Kelola semua pesanan yang masuk</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-sm py-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={fetchAllData} className="btn-primary text-sm py-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="bg-white rounded-card p-4 shadow-soft flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari ID atau nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-100 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  activeFilter === filter
                    ? 'bg-secondary-900 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="bg-white rounded-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase">ID Pesanan</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase">Pelanggan</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase hidden md:table-cell">Rute</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase">Kategori</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase hidden lg:table-cell">Driver</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase">Total</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-secondary-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {filteredOrders.map((order, index) => {
                  const config = statusConfig[order.status];
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-primary-700">{order.orderNumber}</span>
                        <span className="block text-[11px] text-secondary-400">
                          {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-secondary-900">{order.customerName}</span>
                        <span className="block text-[11px] text-secondary-400">{order.whatsappNumber}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-secondary-600">{order.pickupAddress}</span>
                        <span className="block text-xs text-secondary-400">→ {order.destinationAddress}</span>
                        <span className="text-[10px] text-primary-600 font-medium">{formatDistance(order.distance)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-600">{order.category.toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <span className={config?.class}>{config?.label}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-secondary-500">
                        {order.driverName || <span className="text-secondary-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-secondary-900 text-right">
                        {order.grandTotal > 0 ? formatCurrency(order.grandTotal) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {config?.actions.includes('accept') && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'accepted')}
                              className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                              title="Terima"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}
                          {config?.actions.includes('reject') && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                          {config?.actions.includes('assign_driver') && (
                            <button
                              onClick={() => setAssigningOrder(order)}
                              className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                              title="Assign Driver"
                            >
                              <UserPlus className="w-4 h-4 text-blue-500" />
                            </button>
                          )}
                          {config?.actions.includes('on_process') && (
                            <button
                              onClick={() => handleCycleStatus(order)}
                              className="w-8 h-8 rounded-lg bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors"
                              title="Update Status"
                            >
                              <Truck className="w-4 h-4 text-primary-700" />
                            </button>
                          )}
                          <Link
                            href={`/tracking/${order.id}`}
                            className="w-8 h-8 rounded-lg bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors"
                            title="Detail Lacak"
                          >
                            <Eye className="w-4 h-4 text-secondary-500" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-secondary-400 text-sm">
                      Belum ada data pesanan yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      <AnimatePresence>
        {assigningOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-card shadow-soft-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-secondary-100 pb-3">
                <h3 className="text-lg font-bold text-secondary-900">Tugaskan Driver</h3>
                <button onClick={() => setAssigningOrder(null)} className="text-secondary-400 hover:text-secondary-600 font-semibold text-lg">×</button>
              </div>
              <p className="text-sm text-secondary-500">Pilih mitra driver untuk pesanan <strong className="text-primary-750">{assigningOrder.orderNumber}</strong>:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {drivers.filter(d => d.isActive).map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignDriver(assigningOrder.id, driver.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-secondary-100 hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div>
                      <p className="font-semibold text-secondary-900">{driver.name}</p>
                      <p className="text-xs text-secondary-400">{driver.vehiclePlate} · {driver.vehicleType}</p>
                    </div>
                    <span className="text-xs font-semibold text-secondary-700 bg-secondary-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      ★ {driver.rating}
                    </span>
                  </button>
                ))}
                {drivers.filter(d => d.isActive).length === 0 && (
                  <p className="text-sm text-secondary-400 text-center py-4">Tidak ada driver aktif online saat ini.</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAssigningOrder(null)} className="btn-outline text-sm py-2">
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
