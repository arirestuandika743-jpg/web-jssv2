'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Package,
  ShoppingBag,
  Truck,
  Phone,
  MessageCircle,
  Star,
  ArrowLeft,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDistance, cn } from '@/lib/utils';
import { PageTransition, FadeIn } from '@/components/layout/PageTransition';
import { dbService } from '@/services/db';
import type { Order } from '@/types';

const STATUS_ORDER = ['waiting', 'accepted', 'driver_going', 'shopping', 'delivering', 'completed'];

const statusLabels: Record<string, string> = {
  waiting: 'Menunggu Konfirmasi',
  accepted: 'Pesanan Diterima',
  driver_going: 'Driver Menuju Lokasi',
  shopping: 'Sedang Belanja',
  delivering: 'Sedang Diantar',
  completed: 'Pesanan Selesai',
  cancelled: 'Pesanan Dibatalkan',
};

export default function TrackingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchOrder = () => {
        dbService.getOrderById(id)
          .then(data => {
            setOrder(data);
            setLoading(false);
          })
          .catch(err => {
            console.error('Gagal memuat pesanan:', err);
            setLoading(false);
          });
      };

      fetchOrder();
      
      const interval = setInterval(fetchOrder, 15000);
      return () => clearInterval(interval);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-secondary-500 mb-6">Kami tidak menemukan data pesanan dengan ID tersebut.</p>
        <Link href="/dashboard/orders" className="bg-primary px-6 py-2 rounded-lg font-medium text-white hover:bg-primary-600 transition-colors">Kembali ke Riwayat</Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  const timelineSteps = [
    { status: 'waiting', label: 'Pesanan Dibuat', time: new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), icon: Package },
    { status: 'accepted', label: 'Pesanan Diterima', time: currentStatusIndex >= 1 ? 'OK' : '-', icon: CheckCircle2 },
    { status: 'driver_going', label: 'Driver Menuju Lokasi', time: currentStatusIndex >= 2 ? 'OK' : '-', icon: Navigation },
    { status: 'shopping', label: 'Sedang Belanja', time: currentStatusIndex >= 3 ? 'OK' : '-', icon: ShoppingBag },
    { status: 'delivering', label: 'Pesanan Diantar', time: currentStatusIndex >= 4 ? 'OK' : '-', icon: Truck },
    { status: 'completed', label: 'Pesanan Selesai', time: currentStatusIndex >= 5 ? 'Selesai' : '-', icon: CheckCircle2 },
  ];

  const displayTimeline = isCancelled 
    ? [
        { status: 'waiting', label: 'Pesanan Dibuat', time: new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), icon: Package, completed: true, current: false },
        { status: 'cancelled', label: 'Pesanan Dibatalkan', time: 'Batal', icon: XCircle, completed: true, current: true }
      ]
    : timelineSteps.map((step, idx) => ({
        ...step,
        completed: currentStatusIndex >= idx,
        current: currentStatusIndex === idx,
      }));

  const driver = (order as any).driverInfo;

  return (
    <PageTransition>
      <div className="pt-24 pb-16">
        <div className="container-padding max-w-4xl mx-auto">
          <FadeIn>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-secondary-500 hover:text-secondary-900 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Riwayat
            </Link>
          </FadeIn>

          <FadeIn>
            <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 rounded-card p-6 md:p-8 text-white mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Tracking Pesanan</p>
                  <h1 className="text-2xl md:text-3xl font-bold">{order.orderNumber}</h1>
                  <p className="text-sm text-white/60 mt-1">{order.category.toUpperCase()} · {order.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={['waiting', 'accepted', 'driver_going', 'shopping', 'delivering'].includes(order.status) ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      order.status === 'completed' ? 'bg-emerald-400' :
                      order.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-400'
                    )}
                  />
                  <span className={cn(
                    "font-semibold",
                    order.status === 'completed' ? 'text-emerald-400' :
                    order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                  )}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FadeIn delay={0.05}>
                <div className="bg-white rounded-card shadow-soft overflow-hidden">
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-secondary-100 to-secondary-200">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                        backgroundSize: '30px 30px',
                      }}
                    />

                    <div className="absolute" style={{ left: '20%', top: '75%', transform: 'translate(-50%, -100%)' }}>
                      <div className="relative">
                        <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="#FDB813" />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white shadow-soft rounded-lg px-2 py-1 text-[10px] font-semibold text-secondary-900 max-w-[120px] truncate">
                          {order.pickupAddress}
                        </div>
                      </div>
                    </div>

                    <div className="absolute" style={{ left: '85%', top: '20%', transform: 'translate(-50%, -100%)' }}>
                      <div className="relative">
                        <MapPin className="w-8 h-8 text-accent drop-shadow-lg" fill="#FF6B35" />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white shadow-soft rounded-lg px-2 py-1 text-[10px] font-semibold text-secondary-900 max-w-[120px] truncate">
                          {order.destinationAddress}
                        </div>
                      </div>
                    </div>

                    {driver && ['driver_going', 'shopping', 'delivering'].includes(order.status) && (
                      <motion.div
                        animate={{ x: [0, 5, -5, 0], y: [0, -3, 3, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute"
                        style={{ 
                          left: order.status === 'driver_going' ? '35%' : order.status === 'shopping' ? '50%' : '70%', 
                          top: order.status === 'driver_going' ? '60%' : order.status === 'shopping' ? '45%' : '35%', 
                          transform: 'translate(-50%, -50%)' 
                        }}
                      >
                        <div className="w-10 h-10 bg-secondary-900 rounded-full flex items-center justify-center ring-4 ring-secondary-900/20 shadow-lg">
                          <Truck className="w-5 h-5 text-primary" />
                        </div>
                      </motion.div>
                    )}

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft">
                      <p className="text-xs text-secondary-400">Estimasi Tiba</p>
                      <p className="text-lg font-bold text-secondary-900">
                        {order.status === 'completed' ? 'Tiba di Tujuan' :
                         order.status === 'cancelled' ? 'Batal' :
                         order.status === 'delivering' ? '10 menit' :
                         order.status === 'shopping' ? 'Sedang Belanja' :
                         order.status === 'driver_going' ? 'Driver Menuju' : 'Menunggu'}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="bg-white rounded-card p-6 shadow-soft">
                  <h3 className="text-lg font-bold text-secondary-900 mb-6">Status Pesanan</h3>
                  <div className="relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-secondary-100" />
                    <div className="space-y-6">
                      {displayTimeline.map((step, index) => (
                        <motion.div
                          key={step.status}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4 relative"
                        >
                          <div className={cn("relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            step.current ? 'bg-primary text-secondary-900 ring-4 ring-primary/20' : 
                            step.completed ? 'bg-emerald-500 text-white' : 'bg-secondary-100 text-secondary-400'
                          )}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <div className="pt-2">
                            <p className={cn("text-sm font-semibold", step.current ? 'text-primary-700' : step.completed ? 'text-secondary-900' : 'text-secondary-400')}>{step.label}</p>
                            <p className="text-xs text-secondary-400 mt-0.5">{step.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="space-y-6">
              {driver ? (
                <FadeIn delay={0.15}>
                  <div className="bg-white rounded-card p-6 shadow-soft">
                    <h3 className="text-sm font-semibold text-secondary-400 uppercase mb-4">Driver</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-secondary-900 text-lg">{driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900">{driver.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-sm text-secondary-600">{driver.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-secondary-400 mb-4">{driver.vehicle}</p>
                    <div className="flex gap-2">
                      <a href={`tel:${driver.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary-100 hover:bg-secondary-200 rounded-button text-sm font-medium text-secondary-700 transition-colors">
                        <Phone className="w-4 h-4" /> Telepon
                      </a>
                      <a href={`https://wa.me/${driver.phone.startsWith('0') ? '62' + driver.phone.slice(1) : driver.phone}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 hover:bg-green-200 rounded-button text-sm font-medium text-green-700 transition-colors">
                        <MessageCircle className="w-4 h-4" /> Chat
                      </a>
                    </div>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn delay={0.15}>
                  <div className="bg-white rounded-card p-6 shadow-soft text-center py-8">
                    <Loader2 className="w-8 h-8 text-secondary-300 animate-spin mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-secondary-900">Mencari Driver</h4>
                    <p className="text-xs text-secondary-400 mt-1">Sistem sedang mencarikan mitra driver terdekat...</p>
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={0.2}>
                <div className="bg-white rounded-card p-6 shadow-soft">
                  <h3 className="text-sm font-semibold text-secondary-400 uppercase mb-4">Detail Pesanan</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-secondary-400">Jemput</p>
                        <p className="font-medium text-secondary-900">{order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-secondary-400">Tujuan</p>
                        <p className="font-medium text-secondary-900">{order.destinationAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <span className="text-secondary-600">Jarak: {formatDistance(order.distance)}</span>
                    </div>
                  </div>
                  <div className="h-px bg-secondary-100 my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Ongkos Kirim</span>
                      <span className="font-medium text-secondary-900">{formatCurrency(order.deliveryFee)}</span>
                    </div>
                    {order.estimatedItemPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Estimasi Barang</span>
                        <span className="font-medium text-secondary-900">{formatCurrency(order.estimatedItemPrice)}</span>
                      </div>
                    )}
                    <div className="h-px bg-secondary-100 my-2" />
                    <div className="flex justify-between">
                      <span className="font-bold text-secondary-900">Total</span>
                      <span className="font-bold text-primary-700 text-lg">{formatCurrency(order.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
