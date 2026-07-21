/* ============================================
   JSS — TypeScript Type Definitions
   Extended for Courier Dashboard Professional
   ============================================ */

/** Order category type */
export type OrderCategory = 'shopping' | 'food' | 'medicine' | 'documents' | 'packages' | 'ride' | 'others';

/** Order status progression */
export type OrderStatus = 'waiting' | 'accepted' | 'driver_going' | 'shopping' | 'delivering' | 'completed' | 'cancelled';

/** Courier-specific order status (granular steps) */
export type CourierOrderStatus = 'accepted' | 'heading_to_pickup' | 'item_picked_up' | 'delivering' | 'completed';

/** Payment method type */
export type PaymentMethod = 'cash' | 'qris' | 'transfer';

/** Payment status */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** Courier status */
export type CourierStatus = 'online' | 'offline' | 'delivering' | 'break';

/** Courier badge tier */
export type CourierBadge = 'platinum' | 'gold' | 'silver' | 'rookie';

/** Broadcast response */
export type BroadcastResponse = 'accepted' | 'rejected' | 'timeout';

/** Activity log action types */
export type ActivityAction = 
  | 'login' | 'logout' 
  | 'shift_start' | 'shift_end' 
  | 'order_accept' | 'order_reject' | 'order_status_update' | 'order_complete'
  | 'photo_upload' | 'otp_verify' 
  | 'panic_trigger' 
  | 'chat_send'
  | 'location_update';

/** Notification type */
export type NotificationType = 
  | 'order_new' | 'order_broadcast' | 'order_status' | 'order_late'
  | 'shift_reminder' 
  | 'panic_alert' 
  | 'bonus_earned' 
  | 'admin_message' 
  | 'rating_received'
  | 'penalty_warning'
  | 'target_achieved';

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
  distance: number;
  duration: number;
  baseFee: number;
  distanceFee: number;
  weightFee: number;
  shoppingFee: number;
  waitingFee: number;
  heavyItemFee: number;
  largeQuantityFee: number;
  remoteAreaFee: number;
  nightServiceFee: number;
  rainFee: number;
  holidayFee?: number;
  peakHourFee?: number;
  serviceFee?: number;
  insuranceFee?: number;
  isRoundTrip?: boolean;
  roundTripFee?: number;
  promoDiscount?: number;
  totalDeliveryFee: number;
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
  // Extended fields for courier dashboard
  courierStatus?: CourierOrderStatus;
  proofPhotoUrl?: string;
  otpCode?: string;
  otpVerified?: boolean;
  customerRating?: number;
  customerReview?: string;
  completedAt?: string;
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

/** Driver (extended for courier dashboard) */
export interface Driver {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  isActive: boolean;
  currentLocation?: LatLng;
  rating: number;
  totalDeliveries: number;
  // Courier dashboard extensions
  status?: CourierStatus;
  balance?: number;
  batteryLevel?: number;
  deviceInfo?: string;
  lastActiveAt?: string;
  penaltyPoints?: number;
  badge?: CourierBadge;
  dailyOrderCount?: number;
  totalCancel?: number;
  currentSpeed?: number;
  shiftStartedAt?: string;
  activeOrderId?: string;
}

/** Dashboard statistics (extended) */
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
  // Courier dashboard extensions
  ordersInProgress?: number;
  couriersOnline?: number;
  couriersOffline?: number;
  couriersDelivering?: number;
  couriersOnBreak?: number;
  totalPendapatan?: number;
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

// ============================================
// NEW TYPES FOR COURIER DASHBOARD
// ============================================

/** Courier Shift */
export interface CourierShift {
  id: string;
  courierId: string;
  startTime: string;
  endTime?: string;
  startLocation?: LatLng;
  endLocation?: LatLng;
  deviceInfo?: string;
  ipAddress?: string;
  isActive: boolean;
}

/** Order Broadcast */
export interface OrderBroadcast {
  id: string;
  orderId: string;
  courierId: string;
  courierName: string;
  response: BroadcastResponse;
  respondedAt?: string;
  createdAt: string;
}

/** Order Status Log */
export interface OrderStatusLog {
  id: string;
  orderId: string;
  status: CourierOrderStatus;
  timestamp: string;
  location?: LatLng;
  note?: string;
}

/** Order Proof (photo evidence) */
export interface OrderProof {
  id: string;
  orderId: string;
  photoUrl: string;
  type: 'item' | 'customer_receipt';
  uploadedAt: string;
}

/** Order OTP */
export interface OrderOTP {
  id: string;
  orderId: string;
  code: string;
  verified: boolean;
  createdAt: string;
  verifiedAt?: string;
}

/** Courier Location (GPS tracking) */
export interface CourierLocation {
  id: string;
  courierId: string;
  location: LatLng;
  speed?: number;
  heading?: number;
  accuracy?: number;
  batteryLevel?: number;
  timestamp: string;
  isFakeGPS?: boolean;
}

/** Chat Room */
export interface ChatRoom {
  id: string;
  courierId: string;
  courierName: string;
  adminId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

/** Chat Message */
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'courier' | 'admin';
  type: 'text' | 'image' | 'location';
  content: string;
  imageUrl?: string;
  location?: LatLng;
  isRead: boolean;
  createdAt: string;
}

/** Notification */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

/** Panic Alert */
export interface PanicAlert {
  id: string;
  courierId: string;
  courierName: string;
  location: LatLng;
  orderId?: string;
  message?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

/** Activity Log */
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

/** Courier Rating (from customer) */
export interface CourierRating {
  id: string;
  orderId: string;
  courierId: string;
  customerId: string;
  customerName: string;
  rating: number;
  review?: string;
  reasons?: string[];
  createdAt: string;
}

/** Courier Penalty */
export interface CourierPenalty {
  id: string;
  courierId: string;
  reason: string;
  points: number;
  orderId?: string;
  createdAt: string;
}

/** Daily Target */
export interface DailyTarget {
  id: string;
  targetOrders: number;
  bonusAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Courier Incentive */
export interface CourierIncentive {
  id: string;
  courierId: string;
  targetId: string;
  amount: number;
  achieved: boolean;
  achievedAt?: string;
  date: string;
}

/** Leaderboard Entry */
export interface LeaderboardEntry {
  rank: number;
  courierId: string;
  courierName: string;
  avatarUrl?: string;
  totalOrders: number;
  rating: number;
  onTimeRate: number;
  totalEarnings: number;
  cancelCount: number;
  badge: CourierBadge;
  score: number;
}

/** Fraud Detection Result */
export interface FraudCheckResult {
  courierId: string;
  isSuspicious: boolean;
  reasons: string[];
  checkTimestamp: string;
  fakeGPS: boolean;
  tooFastCompletion: boolean;
  noMovement: boolean;
  frequentCancel: boolean;
}

/** Analytics Data */
export interface AnalyticsData {
  ordersPerDay: { date: string; count: number }[];
  revenuePerDay: { date: string; amount: number }[];
  peakHours: { hour: number; count: number }[];
  topCouriers: { name: string; orders: number; rating: number }[];
  busiestAreas: { area: string; orders: number }[];
  cancelRate: number;
  avgDeliveryTime: number;
  avgRating: number;
}

/** Export Filter */
export interface ExportFilter {
  startDate: string;
  endDate: string;
  type: 'orders' | 'revenue' | 'couriers' | 'full';
  format: 'xlsx' | 'pdf';
}
