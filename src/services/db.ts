'use client';

import { createClient } from '@/lib/supabase';
import { isSupabaseEnabled } from './auth';
import { sanitizeString, sanitizePhoneNumber } from '@/lib/sanitizer';
import { auditLogger } from '@/services/auditLogger';
import type { Order, OrderFormData, Driver, User, OrderStatus, LatLng, DashboardStats } from '@/types';

const supabase = isSupabaseEnabled ? createClient() : null;

// Mock key constants
const MOCK_ORDERS_KEY = 'jss_mock_orders';
const MOCK_DRIVERS_KEY = 'jss_mock_drivers';
const MOCK_ADDRESSES_KEY = 'jss_mock_addresses';
const MOCK_USERS_KEY = 'jss_mock_users';

// Demo initial drivers to seed
const INITIAL_DRIVERS: Driver[] = [
  { id: 'drv-1', name: 'Agus Setiawan', phone: '081298765432', vehicleType: 'Motorcycle', vehiclePlate: 'BE 1234 CD', isActive: true, rating: 4.8, totalDeliveries: 342 },
  { id: 'drv-2', name: 'Deni Kurniawan', phone: '081298765433', vehicleType: 'Motorcycle', vehiclePlate: 'BE 5678 EF', isActive: true, rating: 4.9, totalDeliveries: 287 },
  { id: 'drv-3', name: 'Rudi Hermawan', phone: '081298765434', vehicleType: 'Motorcycle', vehiclePlate: 'BE 9012 GH', isActive: true, rating: 4.7, totalDeliveries: 198 },
  { id: 'drv-4', name: 'Hadi Santoso', phone: '081298765435', vehicleType: 'Motorcycle', vehiclePlate: 'BE 3456 IJ', isActive: false, rating: 4.6, totalDeliveries: 156 },
  { id: 'drv-5', name: 'Bambang Wijaya', phone: '081298765436', vehicleType: 'Motorcycle', vehiclePlate: 'BE 7890 KL', isActive: true, rating: 4.5, totalDeliveries: 89 },
];

// Demo initial orders to seed
const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'JSS-2401',
    customerId: 'customer-id-123',
    customerName: 'Rina Sulistiani',
    whatsappNumber: '081234567890',
    pickupAddress: 'Pasar Kalirejo',
    pickupCoordinates: { lat: -5.2818, lng: 104.9833 },
    destinationAddress: 'Desa Bangun Rejo, RT 03/RW 02',
    destinationCoordinates: { lat: -5.2700, lng: 104.9700 },
    category: 'shopping',
    description: 'Belanja bahan pokok: beras 5kg, minyak 2L, gula 1kg',
    estimatedItemPrice: 85000,
    deliveryFee: 14500,
    grandTotal: 99500,
    status: 'delivering',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    distance: 3200,
    duration: 720,
    driverId: 'drv-1',
    driverName: 'Agus Setiawan',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'order-2',
    orderNumber: 'JSS-2400',
    customerId: 'customer-id-123',
    customerName: 'Budi Hartono',
    whatsappNumber: '081234567891',
    pickupAddress: 'Warung Makan Jaya',
    pickupCoordinates: { lat: -5.2830, lng: 104.9850 },
    destinationAddress: 'Desa Sendang Agung',
    destinationCoordinates: { lat: -5.2900, lng: 105.0000 },
    category: 'food',
    description: 'Beli nasi goreng 2 porsi',
    estimatedItemPrice: 28000,
    deliveryFee: 10000,
    grandTotal: 38000,
    status: 'accepted',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    distance: 4100,
    duration: 900,
    driverId: 'drv-2',
    driverName: 'Deni Kurniawan',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'order-3',
    orderNumber: 'JSS-2399',
    customerId: 'customer-id-123',
    customerName: 'Siti Aminah',
    whatsappNumber: '081234567892',
    pickupAddress: 'Apotek Sehat',
    pickupCoordinates: { lat: -5.2835, lng: 104.9830 },
    destinationAddress: 'Desa Padang Ratu',
    destinationCoordinates: { lat: -5.3000, lng: 104.9600 },
    category: 'medicine',
    description: 'Beli Paracetamol 1 strip dan Vitamin C',
    estimatedItemPrice: 15000,
    deliveryFee: 12000,
    grandTotal: 27000,
    status: 'completed',
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    distance: 5000,
    duration: 1100,
    driverId: 'drv-3',
    driverName: 'Rudi Hermawan',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
  }
];

// Helper to get/set mock storage
function getMockOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  const stored = localStorage.getItem(MOCK_ORDERS_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_ORDERS;
  }
}

function saveMockOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

function getMockDrivers(): Driver[] {
  if (typeof window === 'undefined') return INITIAL_DRIVERS;
  const stored = localStorage.getItem(MOCK_DRIVERS_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_DRIVERS_KEY, JSON.stringify(INITIAL_DRIVERS));
    return INITIAL_DRIVERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_DRIVERS;
  }
}

function saveMockDrivers(drivers: Driver[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_DRIVERS_KEY, JSON.stringify(drivers));
}

export const dbService = {
  /**
   * Mengambil daftar seluruh driver (Untuk Admin)
   */
  async getDrivers(): Promise<Driver[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        vehicleType: d.vehicle_type,
        vehiclePlate: d.vehicle_plate,
        isActive: d.is_active,
        currentLocation: d.current_lat ? { lat: d.current_lat, lng: d.current_lng } : undefined,
        rating: Number(d.rating),
        totalDeliveries: d.total_deliveries,
      }));
    } else {
      return getMockDrivers();
    }
  },

  /**
   * Mengambil daftar seluruh pelanggan terdaftar
   */
  async getCustomers(): Promise<User[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('name');
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        email: '', // Not exposed from profiles table for safety
        name: p.name,
        phone: p.phone,
        role: p.role,
        avatarUrl: p.avatar_url,
        createdAt: p.created_at,
      }));
    } else {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(MOCK_USERS_KEY);
      if (stored) {
        try {
          const list: User[] = JSON.parse(stored);
          return list.filter(u => u.role === 'customer');
        } catch (e) {
          return [];
        }
      }
      return [];
    }
  },

  /**
   * Membuat pesanan baru
   */
  async createOrder(
    formData: OrderFormData,
    pricing: { distance: number; duration: number; totalDeliveryFee: number; grandTotal: number },
    customerId?: string
  ): Promise<Order> {
    const cleanCustomerName = sanitizeString(formData.customerName);
    const cleanWhatsappNumber = sanitizePhoneNumber(formData.whatsappNumber);
    const cleanPickupAddress = sanitizeString(formData.pickupAddress);
    const cleanDestinationAddress = sanitizeString(formData.destinationAddress);
    const cleanDescription = sanitizeString(formData.description);
    const cleanDeliveryNotes = formData.deliveryNotes ? sanitizeString(formData.deliveryNotes) : null;

    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId || null,
          customer_name: cleanCustomerName,
          whatsapp_number: cleanWhatsappNumber,
          pickup_address: cleanPickupAddress,
          pickup_lat: formData.pickupCoordinates?.lat || null,
          pickup_lng: formData.pickupCoordinates?.lng || null,
          destination_address: cleanDestinationAddress,
          destination_lat: formData.destinationCoordinates?.lat || null,
          destination_lng: formData.destinationCoordinates?.lng || null,
          category: formData.category,
          description: cleanDescription,
          photo_url: formData.photoUrl || null,
          estimated_item_price: formData.estimatedItemPrice || 0,
          delivery_notes: cleanDeliveryNotes,
          distance: pricing.distance,
          duration: pricing.duration,
          delivery_fee: pricing.totalDeliveryFee,
          grand_total: pricing.grandTotal,
          status: 'waiting',
          payment_method: formData.paymentMethod,
          payment_status: 'pending',
        })
        .select('*')
        .single();

      if (error) throw error;

      auditLogger.log('ORDER_CREATED', `Pesanan baru dibuat: ${data.order_number}`, { orderId: data.id }, customerId);

      return {
        id: data.id,
        orderNumber: data.order_number,
        customerId: data.customer_id,
        customerName: data.customer_name,
        whatsappNumber: data.whatsapp_number,
        pickupAddress: data.pickup_address,
        pickupCoordinates: data.pickup_lat ? { lat: data.pickup_lat, lng: data.pickup_lng } : undefined,
        destinationAddress: data.destination_address,
        destinationCoordinates: data.destination_lat ? { lat: data.destination_lat, lng: data.destination_lng } : undefined,
        category: data.category,
        description: data.description,
        photoUrl: data.photo_url,
        estimatedItemPrice: Number(data.estimated_item_price),
        deliveryNotes: data.delivery_notes,
        distance: data.distance,
        duration: data.duration,
        deliveryFee: Number(data.delivery_fee),
        grandTotal: Number(data.grand_total),
        status: data.status,
        paymentMethod: data.payment_method,
        paymentStatus: data.payment_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      const orders = getMockOrders();
      const newOrderNum = `JSS-${2402 + orders.length}`;
      
      const newOrder: Order = {
        id: `ord-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: newOrderNum,
        customerId: customerId || 'customer-id-123',
        customerName: cleanCustomerName,
        whatsappNumber: cleanWhatsappNumber,
        pickupAddress: cleanPickupAddress,
        pickupCoordinates: formData.pickupCoordinates,
        destinationAddress: cleanDestinationAddress,
        destinationCoordinates: formData.destinationCoordinates,
        category: formData.category,
        description: cleanDescription,
        photoUrl: formData.photoUrl,
        estimatedItemPrice: formData.estimatedItemPrice || 0,
        deliveryNotes: cleanDeliveryNotes || undefined,
        distance: pricing.distance,
        duration: pricing.duration,
        deliveryFee: pricing.totalDeliveryFee,
        grandTotal: pricing.grandTotal,
        status: 'waiting',
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      orders.unshift(newOrder); // Add to beginning
      saveMockOrders(orders);
      return newOrder;
    }
  },

  /**
   * Mengambil riwayat pesanan milik pelanggan tertentu
   */
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        orderNumber: item.order_number,
        customerId: item.customer_id,
        customerName: item.customer_name,
        whatsappNumber: item.whatsapp_number,
        pickupAddress: item.pickup_address,
        pickupCoordinates: item.pickup_lat ? { lat: item.pickup_lat, lng: item.pickup_lng } : undefined,
        destinationAddress: item.destination_address,
        destinationCoordinates: item.destination_lat ? { lat: item.destination_lat, lng: item.destination_lng } : undefined,
        category: item.category,
        description: item.description,
        photoUrl: item.photo_url,
        estimatedItemPrice: Number(item.estimated_item_price),
        deliveryNotes: item.delivery_notes,
        distance: item.distance,
        duration: item.duration,
        deliveryFee: Number(item.delivery_fee),
        grandTotal: Number(item.grand_total),
        status: item.status,
        paymentMethod: item.payment_method,
        paymentStatus: item.payment_status,
        driverId: item.driver_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } else {
      const orders = getMockOrders();
      return orders.filter(o => o.customerId === customerId);
    }
  },

  /**
   * Mengambil semua pesanan (Untuk Admin)
   */
  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          driver:drivers(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        orderNumber: item.order_number,
        customerId: item.customer_id,
        customerName: item.customer_name,
        whatsappNumber: item.whatsapp_number,
        pickupAddress: item.pickup_address,
        pickupCoordinates: item.pickup_lat ? { lat: item.pickup_lat, lng: item.pickup_lng } : undefined,
        destinationAddress: item.destination_address,
        destinationCoordinates: item.destination_lat ? { lat: item.destination_lat, lng: item.destination_lng } : undefined,
        category: item.category,
        description: item.description,
        photoUrl: item.photo_url,
        estimatedItemPrice: Number(item.estimated_item_price),
        deliveryNotes: item.delivery_notes,
        distance: item.distance,
        duration: item.duration,
        deliveryFee: Number(item.delivery_fee),
        grandTotal: Number(item.grand_total),
        status: item.status,
        paymentMethod: item.payment_method,
        paymentStatus: item.payment_status,
        driverId: item.driver_id,
        driverName: item.driver?.name || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } else {
      return getMockOrders();
    }
  },

  /**
   * Mengambil detail satu pesanan berdasarkan ID (untuk Lacak & Detail)
   */
  async getOrderById(idOrNumber: string): Promise<Order | null> {
    if (isSupabaseEnabled && supabase) {
      const query = supabase
        .from('orders')
        .select(`
          *,
          driver:drivers(name, phone, vehicle_plate, rating)
        `);
      
      // Allow query by UUID id or clean order number
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
      const { data, error } = isUuid 
        ? await query.eq('id', idOrNumber).maybeSingle()
        : await query.eq('order_number', idOrNumber).maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        orderNumber: data.order_number,
        customerId: data.customer_id,
        customerName: data.customer_name,
        whatsappNumber: data.whatsapp_number,
        pickupAddress: data.pickup_address,
        pickupCoordinates: data.pickup_lat ? { lat: data.pickup_lat, lng: data.pickup_lng } : undefined,
        destinationAddress: data.destination_address,
        destinationCoordinates: data.destination_lat ? { lat: data.destination_lat, lng: data.destination_lng } : undefined,
        category: data.category,
        description: data.description,
        photoUrl: data.photo_url,
        estimatedItemPrice: Number(data.estimated_item_price),
        deliveryNotes: data.delivery_notes,
        distance: data.distance,
        duration: data.duration,
        deliveryFee: Number(data.delivery_fee),
        grandTotal: Number(data.grand_total),
        status: data.status,
        paymentMethod: data.payment_method,
        paymentStatus: data.payment_status,
        driverId: data.driver_id,
        driverName: data.driver?.name || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        // Optional inject driver info if joined
        ...(data.driver ? {
          driverInfo: {
            name: data.driver.name,
            phone: data.driver.phone,
            vehicle: data.driver.vehicle_plate,
            rating: Number(data.driver.rating)
          }
        } : {})
      } as any;
    } else {
      const orders = getMockOrders();
      const order = orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber);
      if (!order) return null;

      // Inject mock driver details for tracking page if driver is assigned
      if (order.driverId) {
        const drivers = getMockDrivers();
        const drv = drivers.find(d => d.id === order.driverId);
        if (drv) {
          return {
            ...order,
            driverName: drv.name,
            driverInfo: {
              name: drv.name,
              phone: drv.phone,
              vehicle: `${drv.vehicleType} - ${drv.vehiclePlate}`,
              rating: drv.rating
            }
          } as any;
        }
      }

      return order;
    }
  },

  /**
   * Memperbarui status pesanan
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } else {
      const orders = getMockOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) return false;

      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      
      // Auto set payment status to paid if completed
      if (status === 'completed') {
        orders[index].paymentStatus = 'paid';
      }

      saveMockOrders(orders);
      return true;
    }
  },

  /**
   * Menugaskan driver ke pesanan
   */
  async assignDriver(orderId: string, driverId: string): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } else {
      const orders = getMockOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) return false;

      const drivers = getMockDrivers();
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) return false;

      orders[index].driverId = driverId;
      orders[index].driverName = driver.name;
      orders[index].status = 'accepted';
      orders[index].updatedAt = new Date().toISOString();

      saveMockOrders(orders);
      return true;
    }
  },

  /**
   * Mengambil statistik ringkasan dashboard (Untuk Admin)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    if (isSupabaseEnabled && supabase) {
      // Direct count & sums from Supabase
      const today = new Date();
      today.setHours(0,0,0,0);

      const { data: todayOrders } = await supabase
        .from('orders')
        .select('id, grand_total, status')
        .gte('created_at', today.toISOString());

      const { count: pending } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting');

      const { count: completed } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: cancelled } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      // Sum today revenue
      const tOrders = todayOrders || [];
      const revenueToday = tOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.grand_total), 0);

      return {
        todayOrders: tOrders.length,
        todayRevenue: revenueToday,
        pendingOrders: pending || 0,
        completedOrders: completed || 0,
        cancelledOrders: cancelled || 0,
        monthlyRevenue: 4800000 // Placeholder static for graph
      };
    } else {
      const orders = getMockOrders();
      const today = new Date();
      today.setHours(0,0,0,0);

      const todayList = orders.filter(o => new Date(o.createdAt) >= today);
      const todayRevenue = todayList
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.grandTotal, 0);

      const pending = orders.filter(o => o.status === 'waiting').length;
      const completed = orders.filter(o => o.status === 'completed').length;
      const cancelled = orders.filter(o => o.status === 'cancelled').length;

      return {
        todayOrders: todayList.length,
        todayRevenue,
        pendingOrders: pending,
        completedOrders: completed,
        cancelledOrders: cancelled,
        monthlyRevenue: 4200000,
      };
    }
  },

  /**
   * Mengunggah berkas gambar ke Supabase Storage
   */
  async uploadFile(file: File, bucket: string = 'order-photos'): Promise<string> {
    if (isSupabaseEnabled && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } else {
      throw new Error('Supabase is not enabled');
    }
  },

  /**
   * Berlangganan (Realtime Subscription) ke perubahan status pesanan tertentu
   */
  subscribeToOrder(orderId: string, onUpdate: (payload: any) => void) {
    if (isSupabaseEnabled && supabase) {
      return supabase
        .channel(`order-${orderId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => onUpdate(payload.new)
        )
        .subscribe();
    }
    return null;
  },

  /**
   * Berlangganan (Realtime Subscription) ke seluruh daftar pesanan (Admin / Dashboard)
   */
  subscribeToAllOrders(onUpdate: (payload: any) => void) {
    if (isSupabaseEnabled && supabase) {
      return supabase
        .channel('all-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => onUpdate(payload)
        )
        .subscribe();
    }
    return null;
  },

  /**
   * Berlangganan (Realtime Subscription) ke pergerakan lokasi driver aktif
   */
  subscribeToDrivers(onUpdate: (payload: any) => void) {
    if (isSupabaseEnabled && supabase) {
      return supabase
        .channel('active-drivers')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'drivers' },
          (payload) => onUpdate(payload)
        )
        .subscribe();
    }
    return null;
  }
};
