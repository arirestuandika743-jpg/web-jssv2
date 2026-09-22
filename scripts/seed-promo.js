import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env.production') });
dotenv.config({ path: resolve('.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log('Skipping Supabase insert: Missing credentials');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPrivatePromo() {
  const newPromo = {
    id: `promo-private-${Date.now()}`,
    code: 'JSS-GIVEAWAY-X5K9',
    discount_amount: 5000,
    winner_name: 'Pemenang Giveaway',
    winner_whatsapp: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usage_count: 0,
    max_usage: 1,
    status: 'active'
  };

  const { data, error } = await supabase.from('promo_codes').insert(newPromo);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Private promo code created successfully: JSS-GIVEAWAY-X5K9');
  }
}

createPrivatePromo();
