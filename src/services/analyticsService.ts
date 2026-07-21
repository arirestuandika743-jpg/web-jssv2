'use client';

import type { AnalyticsData, Order, Driver, CourierRating, ExportFilter } from '@/types';

function getMock<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try { return JSON.parse(stored); } catch { return fallback; }
}

function setMock<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

const MOCK_RATINGS_KEY = 'jss_courier_ratings';

export const analyticsService = {
  /** Get full analytics data */
  async getAnalytics(days: number = 30): Promise<AnalyticsData> {
    const orders = getMock<Order>('jss_mock_orders_v3');
    const drivers = getMock<Driver>('jss_mock_drivers');

    // Generate orders per day data
    const ordersPerDay: { date: string; count: number }[] = [];
    const revenuePerDay: { date: string; amount: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => o.createdAt.startsWith(dateStr));
      ordersPerDay.push({ date: dateStr, count: dayOrders.length });
      
      const dayRevenue = dayOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.grandTotal, 0);
      revenuePerDay.push({ date: dateStr, amount: dayRevenue });
    }

    // Generate realistic demo data if no real orders exist
    if (orders.length < 5) {
      const demoHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
      const peakHours = demoHours.map(hour => ({
        hour,
        count: hour >= 11 && hour <= 13 ? Math.floor(15 + Math.random() * 10) :
               hour >= 17 && hour <= 19 ? Math.floor(12 + Math.random() * 8) :
               Math.floor(3 + Math.random() * 7)
      }));

      const demoOrdersPerDay = [];
      const demoRevenuePerDay = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        demoOrdersPerDay.push({ date: dateStr, count: Math.floor((isWeekend ? 8 : 15) + Math.random() * 10) });
        demoRevenuePerDay.push({ date: dateStr, amount: Math.floor((isWeekend ? 200000 : 400000) + Math.random() * 300000) });
      }

      return {
        ordersPerDay: demoOrdersPerDay,
        revenuePerDay: demoRevenuePerDay,
        peakHours,
        topCouriers: drivers.slice(0, 5).map(d => ({ name: d.name, orders: d.totalDeliveries, rating: d.rating })),
        busiestAreas: [
          { area: 'Kalirejo', orders: 45 },
          { area: 'Sendang Agung', orders: 38 },
          { area: 'Bangun Rejo', orders: 32 },
          { area: 'Padang Ratu', orders: 28 },
          { area: 'Sinar Jati', orders: 21 },
        ],
        cancelRate: 5.2,
        avgDeliveryTime: 28,
        avgRating: 4.7,
      };
    }

    // Peak hours
    const peakHours: { hour: number; count: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const count = orders.filter(o => new Date(o.createdAt).getHours() === h).length;
      peakHours.push({ hour: h, count });
    }

    // Top couriers
    const topCouriers = drivers
      .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
      .slice(0, 5)
      .map(d => ({ name: d.name, orders: d.totalDeliveries, rating: d.rating }));

    // Cancel rate
    const totalOrders = orders.length || 1;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const cancelRate = (cancelledOrders / totalOrders) * 100;

    // Average delivery time (mock: random between 20-40 min)
    const avgDeliveryTime = 28;

    // Average rating
    const avgRating = drivers.length > 0
      ? drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length
      : 4.5;

    return {
      ordersPerDay,
      revenuePerDay,
      peakHours,
      topCouriers,
      busiestAreas: [
        { area: 'Kalirejo', orders: Math.floor(totalOrders * 0.3) },
        { area: 'Sendang Agung', orders: Math.floor(totalOrders * 0.2) },
        { area: 'Bangun Rejo', orders: Math.floor(totalOrders * 0.15) },
        { area: 'Padang Ratu', orders: Math.floor(totalOrders * 0.12) },
        { area: 'Sinar Jati', orders: Math.floor(totalOrders * 0.1) },
      ],
      cancelRate: Math.round(cancelRate * 10) / 10,
      avgDeliveryTime,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  },

  /** Get enhanced dashboard stats */
  async getEnhancedStats(): Promise<{
    ordersToday: number;
    ordersInProgress: number;
    ordersCompleted: number;
    ordersCancelled: number;
    couriersOnline: number;
    couriersOffline: number;
    couriersDelivering: number;
    couriersOnBreak: number;
    totalRevenue: number;
  }> {
    const orders = getMock<Order>('jss_mock_orders_v3');
    const drivers = getMock<Driver>('jss_mock_drivers');
    const statuses = getMock<{ id: string; status: string }>('jss_courier_status');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);

    // Count courier statuses
    let online = 0, offline = 0, delivering = 0, onBreak = 0;
    drivers.forEach(d => {
      const s = statuses.find(st => st.id === d.id);
      const status = s?.status || (d.status || 'offline');
      if (status === 'online') online++;
      else if (status === 'delivering') delivering++;
      else if (status === 'break') onBreak++;
      else offline++;
    });

    return {
      ordersToday: todayOrders.length,
      ordersInProgress: orders.filter(o => ['accepted', 'driver_going', 'shopping', 'delivering'].includes(o.status)).length,
      ordersCompleted: orders.filter(o => o.status === 'completed').length,
      ordersCancelled: orders.filter(o => o.status === 'cancelled').length,
      couriersOnline: online,
      couriersOffline: offline,
      couriersDelivering: delivering,
      couriersOnBreak: onBreak,
      totalRevenue: todayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.grandTotal, 0),
    };
  },

  // ============================================
  // CUSTOMER RATING
  // ============================================

  /** Submit customer rating */
  async submitRating(
    orderId: string,
    courierId: string,
    customerId: string,
    customerName: string,
    rating: number,
    review?: string,
    reasons?: string[]
  ): Promise<CourierRating> {
    const ratingEntry: CourierRating = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      courierId,
      customerId,
      customerName,
      rating,
      review,
      reasons,
      createdAt: new Date().toISOString(),
    };

    const ratings = getMock<CourierRating>(MOCK_RATINGS_KEY);
    ratings.push(ratingEntry);
    setMock(MOCK_RATINGS_KEY, ratings);

    // Update driver average rating
    const drivers = getMock<Driver>('jss_mock_drivers');
    const driverIdx = drivers.findIndex(d => d.id === courierId);
    if (driverIdx !== -1) {
      const driverRatings = ratings.filter(r => r.courierId === courierId);
      const avgRating = driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length;
      drivers[driverIdx].rating = Math.round(avgRating * 10) / 10;
      setMock('jss_mock_drivers', drivers);
    }

    // Update order with rating
    const orders = getMock<Order>('jss_mock_orders_v3');
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx !== -1) {
      orders[orderIdx].customerRating = rating;
      orders[orderIdx].customerReview = review;
      setMock('jss_mock_orders_v3', orders);
    }

    return ratingEntry;
  },

  /** Get ratings for a courier */
  async getCourierRatings(courierId: string): Promise<CourierRating[]> {
    const ratings = getMock<CourierRating>(MOCK_RATINGS_KEY);
    return ratings.filter(r => r.courierId === courierId);
  },

  // ============================================
  // EXPORT
  // ============================================

  /** Export data to format */
  async prepareExportData(filter: ExportFilter): Promise<any[]> {
    const orders = getMock<Order>('jss_mock_orders_v3');
    const drivers = getMock<Driver>('jss_mock_drivers');

    const startDate = new Date(filter.startDate);
    const endDate = new Date(filter.endDate);
    endDate.setHours(23, 59, 59, 999);

    const filteredOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= startDate && d <= endDate;
    });

    if (filter.type === 'orders') {
      return filteredOrders.map(o => ({
        'No Order': o.orderNumber,
        'Customer': o.customerName,
        'WhatsApp': o.whatsappNumber,
        'Kategori': o.category,
        'Status': o.status,
        'Kurir': o.driverName || '-',
        'Jarak (m)': o.distance,
        'Biaya Kirim': o.deliveryFee,
        'Total': o.grandTotal,
        'Pembayaran': o.paymentMethod,
        'Tanggal': new Date(o.createdAt).toLocaleDateString('id-ID'),
      }));
    }

    if (filter.type === 'revenue') {
      return filteredOrders.filter(o => o.status === 'completed').map(o => ({
        'No Order': o.orderNumber,
        'Customer': o.customerName,
        'Total': o.grandTotal,
        'Biaya Kirim': o.deliveryFee,
        'Metode Bayar': o.paymentMethod,
        'Tanggal': new Date(o.createdAt).toLocaleDateString('id-ID'),
      }));
    }

    if (filter.type === 'couriers') {
      return drivers.map(d => ({
        'Nama': d.name,
        'Telepon': d.phone,
        'Kendaraan': d.vehicleType,
        'Plat': d.vehiclePlate,
        'Rating': d.rating,
        'Total Antar': d.totalDeliveries,
        'Status': d.isActive ? 'Aktif' : 'Nonaktif',
      }));
    }

    // Full report
    return filteredOrders.map(o => ({
      'No Order': o.orderNumber,
      'Customer': o.customerName,
      'Kategori': o.category,
      'Alamat Jemput': o.pickupAddress,
      'Alamat Tujuan': o.destinationAddress,
      'Status': o.status,
      'Kurir': o.driverName || '-',
      'Jarak (m)': o.distance,
      'Biaya Kirim': o.deliveryFee,
      'Total': o.grandTotal,
      'Rating': o.customerRating || '-',
      'Tanggal': new Date(o.createdAt).toLocaleDateString('id-ID'),
    }));
  },
};
