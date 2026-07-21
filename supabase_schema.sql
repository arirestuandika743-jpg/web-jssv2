-- ============================================
-- JSS (JASA SURUH KALIREJO) SUPABASE SCHEMA
-- Execute this SQL script in Supabase SQL Editor
-- ============================================

-- 1. Create Deposit Requests Table
CREATE TABLE IF NOT EXISTS public.deposit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number TEXT NOT NULL UNIQUE,
    courier_id TEXT NOT NULL,
    courier_name TEXT NOT NULL,
    courier_phone TEXT,
    amount NUMERIC NOT NULL,
    proof_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Drivers / Courier Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'motorcycle',
    vehicle_plate TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    rating NUMERIC DEFAULT 5.0,
    total_deliveries INT DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'offline',
    lat NUMERIC,
    lng NUMERIC,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat NUMERIC,
    pickup_lng NUMERIC,
    destination_address TEXT NOT NULL,
    destination_lat NUMERIC,
    destination_lng NUMERIC,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    estimated_item_price NUMERIC DEFAULT 0,
    delivery_notes TEXT,
    distance NUMERIC DEFAULT 0,
    duration NUMERIC DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'waiting',
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'pending',
    driver_id TEXT REFERENCES public.drivers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Grant Access
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read deposit_requests" ON public.deposit_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert deposit_requests" ON public.deposit_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update deposit_requests" ON public.deposit_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow public insert drivers" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update drivers" ON public.drivers FOR UPDATE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

-- 5. Atomic Deposit Approval Postgres Function (RPC)
CREATE OR REPLACE FUNCTION approve_deposit(
  p_request_id UUID,
  p_admin_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
  v_courier_id TEXT;
  v_amount NUMERIC;
  v_courier_name TEXT;
  v_courier_phone TEXT;
BEGIN
  -- 1. Lock the deposit request row and check if it exists & is pending
  SELECT status, courier_id, amount, courier_name, courier_phone
  INTO v_status, v_courier_id, v_amount, v_courier_name, v_courier_phone
  FROM public.deposit_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 2. Check if already approved or rejected to prevent double top up
  IF v_status <> 'pending' THEN
    RETURN FALSE;
  END IF;

  -- 3. Update deposit request status
  UPDATE public.deposit_requests
  SET status = 'approved',
      verified_by = p_admin_name,
      verified_at = NOW()
  WHERE id = p_request_id;

  -- 4. Upsert courier balance in drivers table
  INSERT INTO public.drivers (id, name, phone, balance)
  VALUES (v_courier_id, v_courier_name, COALESCE(v_courier_phone, '081234567890'), v_amount)
  ON CONFLICT (id) DO UPDATE
  SET balance = public.drivers.balance + v_amount;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
