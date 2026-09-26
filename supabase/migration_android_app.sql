-- ============================================
-- JSS Kalirejo — Android App Schema Migration
-- Adds: Referral system, Promo campaigns, Promo balance
-- ============================================

-- 1. Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promo_balance NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_new_user_promo_used BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_order_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 2. Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  referrer_reward NUMERIC(12,2) NOT NULL DEFAULT 5000,
  referred_discount_percent INTEGER NOT NULL DEFAULT 20,
  referred_max_discount NUMERIC(12,2) NOT NULL DEFAULT 10000,
  first_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

-- 3. Promo campaigns table (admin-configurable)
CREATE TABLE IF NOT EXISTS public.promo_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_user', 'referral')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  max_discount NUMERIC(12,2) NOT NULL DEFAULT 10000,
  referral_reward NUMERIC(12,2) NOT NULL DEFAULT 5000,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  max_referrals_per_user INTEGER NOT NULL DEFAULT 50,
  total_new_users INTEGER NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_discount_given NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_rewards_given NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Promo balance transactions table
CREATE TABLE IF NOT EXISTS public.promo_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_referral', 'debit_order', 'credit_admin', 'debit_admin')),
  description TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  referral_id UUID REFERENCES public.referrals(id),
  balance_after NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_promo_transactions_user ON public.promo_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_transactions_type ON public.promo_transactions(type);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);

-- 6. RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrals access" ON public.referrals FOR ALL USING (true);
CREATE POLICY "Promo campaigns access" ON public.promo_campaigns FOR ALL USING (true);
CREATE POLICY "Promo transactions access" ON public.promo_transactions FOR ALL USING (true);

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_campaigns;

-- 8. Auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    LOOP
      code := 'JSS-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 5));
      SELECT COUNT(*) INTO exists_count FROM public.profiles WHERE referral_code = code;
      EXIT WHEN exists_count = 0;
    END LOOP;
    NEW.referral_code := code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- 9. Insert default promo campaigns
INSERT INTO public.promo_campaigns (type, is_active, discount_percent, max_discount, referral_reward)
VALUES 
  ('new_user', true, 20, 10000, 0),
  ('referral', true, 20, 10000, 5000)
ON CONFLICT DO NOTHING;

-- 10. Update order categories to include new types
-- Add car_barang and car_ojek to allowed categories
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_category_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_category_check 
  CHECK (category IN ('shopping', 'food', 'medicine', 'documents', 'packages', 'ride', 'large_cargo', 'carter', 'others', 'car_barang', 'car_ojek'));

-- 11. Add promo tracking to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_discount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_balance_used NUMERIC(12,2) DEFAULT 0;

-- 12. Add courier earnings tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_earnings NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS jss_commission NUMERIC(12,2) DEFAULT 0;
