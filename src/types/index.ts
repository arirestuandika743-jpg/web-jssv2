/* ============================================
   JSS — TypeScript Type Definitions
   ============================================ */

/** Order category type */
export type OrderCategory = 'shopping' | 'food' | 'medicine' | 'documents' | 'packages' | 'ride' | 'others';

/** Order status progression */
export type OrderStatus = 'waiting' | 'accepted' | 'driver_going' | 'shopping' | 'delivering' | 'completed' | 'cancelled';

/** Payment method type */
export type PaymentMethod = 'cash' | 'qris' | 'transfer';

/** Payment status */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** Geographic coordinates */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Address with coordinates */
export interface Address {
  id?: string;
  label?: string;
  address: string;
  coordinates?: LatLng;
  placeId?: string;
}

/** Order form data (from form submission) */
export interface OrderFormData {
  customerName: string;
  whatsappNumber: string;
  pickupAddress: string;
  pickupCoordinates?: LatLng;
  destinationAddress: string;
  destinationCoordinates?: LatLng;
  category: OrderCategory;
  description: string;
  photoUrl?: string;
  estimatedItemPrice?: number;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  passengerCount?: number;
  passengerWeight?: string;
  luggage?: string;
  luggageDescription?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  notes?: string;
}

/** Delivery pricing details */
export interface DeliveryPricing {
  distance: number;       // in meters
  duration: number;       // in seconds
  baseFee: number;        // base service fee
  distanceFee: number;    // distance-based fee
  weightFee: number;      // fee based on weight category
  shoppingFee: number;    // shopping service fee
  waitingFee: number;      // driver waiting fee
  heavyItemFee: number;    // extra fee for heavy items
  largeQuantityFee: number; // fee for large quantity of items
  remoteAreaFee: number;   // extra fee for remote areas
  nightServiceFee: number; // optional night service fee
  rainFee: number;         // optional rain service fee
  holidayFee?: number;     // optional holiday fee
  peakHourFee?: number;    // optional peak hour fee
  serviceFee?: number;     // optional service platform fee
  insuranceFee?: number;   // optional insurance fee
  isRoundTrip?: boolean;   // optional round trip flag
  roundTripFee?: number;   // optional round trip extra fee (2x total multiplier)
  promoDiscount?: number;  // optional promo discount
  totalDeliveryFee: number; // total delivery fee
  estimatedItemPrice: number;
  grandTotal: number;
}


/** Full order object (from database) */
export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  whatsappNumber: string;
  pickupAddress: string;
  pickupCoordinates?: LatLng;
  destinationAddress: string;
  destinationCoordinates?: LatLng;
  category: OrderCategory;
  description: string;
  photoUrl?: string;
  estimatedItemPrice: number;
  deliveryNotes?: string;
  distance: number;
  duration: number;
  deliveryFee: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  driverId?: string;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
}

/** User Roles */
export type UserRole = 'customer' | 'runner' | 'driver' | 'admin' | 'super_admin';

/** User Profile */
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

/** Driver */
export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  isActive: boolean;
  currentLocation?: LatLng;
  rating: number;
  totalDeliveries: number;
}

/** Dashboard statistics */
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
}

/** Coverage area */
export interface CoverageArea {
  name: string;
  description: string;
  isMain: boolean;
  lat: number;
  lng: number;
  radius: number;
}

/** Tracking update */
export interface TrackingUpdate {
  id: string;
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
  location?: LatLng;
}
