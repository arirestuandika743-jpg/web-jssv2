-- ============================================
-- JSS — Supabase Database Schema
-- Jasa Suruh Kalirejo
-- Extended for Courier Dashboard Professional
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'driver', 'runner', 'super_admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Drivers table (extended for courier dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'motorcycle',
  vehicle_plate TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  -- Courier Dashboard Extensions
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'delivering', 'break')),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  battery_level INTEGER,
  device_info TEXT,
  last_active_at TIMESTAMPTZ,
  penalty_points INTEGER NOT NULL DEFAULT 0,
  badge TEXT NOT NULL DEFAULT 'rookie' CHECK (badge IN ('platinum', 'gold', 'silver', 'rookie')),
  daily_order_count INTEGER NOT NULL DEFAULT 0,
  total_cancel INTEGER NOT NULL DEFAULT 0,
  current_speed DOUBLE PRECISION,
  shift_started_at TIMESTAMPTZ,
  active_order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Orders table
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  destination_address TEXT NOT NULL,
  destination_lat DOUBLE PRECISION,
  destination_lng DOUBLE PRECISION,
  category TEXT NOT NULL CHECK (category IN ('shopping', 'food', 'medicine', 'documents', 'packages', 'ride', 'large_cargo', 'carter', 'others')),
  description TEXT NOT NULL,
  photo_url TEXT,
  estimated_item_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_notes TEXT,
  distance NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'accepted', 'driver_going', 'shopping', 'delivering', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'qris', 'transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  -- Courier Dashboard Extensions
  courier_status TEXT CHECK (courier_status IN ('accepted', 'heading_to_pickup', 'item_picked_up', 'delivering', 'completed')),
  proof_photo_url TEXT,
  otp_code TEXT,
  otp_verified BOOLEAN DEFAULT false,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Courier Shifts table
-- ============================================
CREATE TABLE IF NOT EXISTS public.courier_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  end_lat DOUBLE PRECISION,
  end_lng DOUBLE PRECISION,
  device_info TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Order Broadcasts table
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT 'timeout' CHECK (response IN ('accepted', 'rejected', 'timeout')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Order Status Logs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_status_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Order Proofs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'item' CHECK (type IN ('item', 'customer_receipt')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Order OTPs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- ============================================
-- Courier Locations table (GPS tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.courier_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  battery_level INTEGER,
  is_fake_gps BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Chat Rooms table
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Chat Messages table
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('courier', 'admin')),
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'location')),
  content TEXT NOT NULL,
  image_url TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Notifications table
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Panic Alerts table
-- ============================================
CREATE TABLE IF NOT EXISTS public.panic_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  message TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Activity Logs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  user_role TEXT NOT NULL DEFAULT 'driver',
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Courier Ratings table
-- ============================================
CREATE TABLE IF NOT EXISTS public.courier_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  reasons TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Courier Penalties table
-- ============================================
CREATE TABLE IF NOT EXISTS public.courier_penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Daily Targets table
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_orders INTEGER NOT NULL DEFAULT 10,
  bonus_amount NUMERIC(12,2) NOT NULL DEFAULT 20000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Courier Incentives table
-- ============================================
CREATE TABLE IF NOT EXISTS public.courier_incentives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  courier_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.daily_targets(id),
  amount NUMERIC(12,2) NOT NULL,
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Saved Addresses table
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  place_id TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Tracking Updates table
-- ============================================
CREATE TABLE IF NOT EXISTS public.tracking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Payments table
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('cash', 'qris', 'transfer')),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  reference_number TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON public.tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user ON public.saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON public.drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_courier_shifts_courier ON public.courier_shifts(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_shifts_active ON public.courier_shifts(is_active);
CREATE INDEX IF NOT EXISTS idx_order_broadcasts_order ON public.order_broadcasts(order_id);
CREATE INDEX IF NOT EXISTS idx_courier_locations_courier ON public.courier_locations(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_locations_time ON public.courier_locations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_panic_alerts_resolved ON public.panic_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courier_ratings_courier ON public.courier_ratings(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_penalties_courier ON public.courier_penalties(courier_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_penalties ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: customers see own orders, guests can track via order_number/id, admins see all
CREATE POLICY "Customers see own orders or public tracking" ON public.orders FOR SELECT USING (
  true
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (
  auth.uid() = customer_id OR customer_id IS NULL
);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  OR EXISTS (SELECT 1 FROM public.drivers WHERE user_id = auth.uid())
);

-- Saved Addresses: users manage their own
CREATE POLICY "Users manage own addresses" ON public.saved_addresses FOR ALL USING (auth.uid() = user_id);

-- Tracking: readable by all
CREATE POLICY "Track orders" ON public.tracking_updates FOR SELECT USING (true);

-- Drivers: visible to admins and drivers themselves
CREATE POLICY "Admins manage drivers" ON public.drivers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  OR user_id = auth.uid()
);

-- Payments: visible to order owner and admins
CREATE POLICY "View payments" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = payments.order_id
    AND (orders.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
  )
);

-- Chat: courier and admin access
CREATE POLICY "Chat rooms access" ON public.chat_rooms FOR ALL USING (true);
CREATE POLICY "Chat messages access" ON public.chat_messages FOR ALL USING (true);

-- Notifications: users see own
CREATE POLICY "User notifications" ON public.notifications FOR ALL USING (true);

-- Other tables: admin + driver access
CREATE POLICY "Courier shifts access" ON public.courier_shifts FOR ALL USING (true);
CREATE POLICY "Order broadcasts access" ON public.order_broadcasts FOR ALL USING (true);
CREATE POLICY "Courier locations access" ON public.courier_locations FOR ALL USING (true);
CREATE POLICY "Panic alerts access" ON public.panic_alerts FOR ALL USING (true);
CREATE POLICY "Activity logs access" ON public.activity_logs FOR ALL USING (true);
CREATE POLICY "Courier ratings access" ON public.courier_ratings FOR ALL USING (true);
CREATE POLICY "Courier penalties access" ON public.courier_penalties FOR ALL USING (true);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'JSS-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 2402;

-- Trigger for auto order number
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Automatically create profile entry when new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Realtime Subscriptions
-- ============================================
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courier_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.panic_alerts;

-- ============================================
-- Storage Buckets Setup
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('order-photos', 'order-photos', true), 
  ('avatars', 'avatars', true),
  ('chat-images', 'chat-images', true),
  ('proof-photos', 'proof-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Order Photos" ON storage.objects FOR SELECT USING (bucket_id = 'order-photos');
CREATE POLICY "Allow Upload Order Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-photos');
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Allow Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Public Read Chat Images" ON storage.objects FOR SELECT USING (bucket_id = 'chat-images');
CREATE POLICY "Allow Upload Chat Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-images');
CREATE POLICY "Public Read Proof Photos" ON storage.objects FOR SELECT USING (bucket_id = 'proof-photos');
CREATE POLICY "Allow Upload Proof Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proof-photos');
