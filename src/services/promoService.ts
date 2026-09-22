'use client';

import type { PromoCode, PromoCodeStatus } from '@/types';
import { isSupabaseEnabled } from './auth';
import { createClient } from '@/lib/supabase';

const supabase = isSupabaseEnabled ? createClient() : null;
const MOCK_PROMO_KEY = 'jss_mock_promo_codes';

// Helper to get/set mock storage
function getMockPromos(): PromoCode[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(MOCK_PROMO_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveMockPromos(promos: PromoCode[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_PROMO_KEY, JSON.stringify(promos));
}

export const promoService = {
  /**
   * Generate a random, hard-to-guess promo code string
   */
  generateCodeString(type: 'standard' | 'unique' = 'standard'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBlock = (length: number) => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    if (type === 'unique') {
      return `JSS-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`;
    }
    return `JSS-${randomBlock(4)}-${randomBlock(4)}`;
  },

  /**
   * Get all promo codes (Admin)
   */
  async getPromoCodes(): Promise<PromoCode[]> {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching promo codes:', error);
        return [];
      }
      
      return (data || []).map(d => ({
        id: d.id,
        code: d.code,
        discountAmount: Number(d.discount_amount),
        winnerName: d.winner_name,
        winnerWhatsapp: d.winner_whatsapp,
        createdAt: d.created_at,
        expiresAt: d.expires_at,
        usageCount: d.usage_count,
        maxUsage: d.max_usage,
        status: d.status as PromoCodeStatus
      }));
    } else {
      return getMockPromos();
    }
  },

  /**
   * Create a new promo code (Admin)
   */
  async createPromoCode(data: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount' | 'status'>): Promise<PromoCode> {
    const newPromo: PromoCode = {
      ...data,
      id: `promo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      code: data.code.toUpperCase(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      status: 'active'
    };

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('promo_codes')
        .insert({
          id: newPromo.id,
          code: newPromo.code,
          discount_amount: newPromo.discountAmount,
          winner_name: newPromo.winnerName,
          winner_whatsapp: newPromo.winnerWhatsapp || null,
          created_at: newPromo.createdAt,
          expires_at: newPromo.expiresAt,
          usage_count: newPromo.usageCount,
          max_usage: newPromo.maxUsage,
          status: newPromo.status
        });
        
      if (error) throw error;
      return newPromo;
    } else {
      const promos = getMockPromos();
      promos.unshift(newPromo);
      saveMockPromos(promos);
      return newPromo;
    }
  },

  /**
   * Validate a promo code string (Customer)
   */
  async validatePromoCode(codeStr: string, customerWhatsapp?: string): Promise<{ valid: boolean; discountAmount: number; message?: string }> {
    const code = codeStr.toUpperCase().trim();
    if (!code) {
      return { valid: false, discountAmount: 0, message: 'Kode promo tidak boleh kosong.' };
    }

    let promo: PromoCode | undefined;

    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      
      if (data && !error) {
        promo = {
          id: data.id,
          code: data.code,
          discountAmount: Number(data.discount_amount),
          winnerName: data.winner_name,
          winnerWhatsapp: data.winner_whatsapp,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          usageCount: data.usage_count,
          maxUsage: data.max_usage,
          status: data.status as PromoCodeStatus
        };
      }
    } else {
      const promos = getMockPromos();
      promo = promos.find(p => p.code === code);
    }

    if (!promo) {
      return { valid: false, discountAmount: 0, message: 'Kode promo tidak valid.' };
    }

    if (promo.status === 'revoked') {
      return { valid: false, discountAmount: 0, message: 'Kode promo sudah tidak berlaku.' };
    }

    if (promo.status === 'used' || promo.usageCount >= promo.maxUsage) {
      return { valid: false, discountAmount: 0, message: 'Kode promo sudah digunakan.' };
    }

    if (promo.status === 'expired' || new Date() > new Date(promo.expiresAt)) {
      return { valid: false, discountAmount: 0, message: 'Kode promo sudah kedaluwarsa.' };
    }

    // Optional WA check if code is bound to a specific winner
    if (promo.winnerWhatsapp && customerWhatsapp) {
      // Clean up both WA numbers just in case
      const cleanTargetWA = promo.winnerWhatsapp.replace(/\D/g, '');
      const cleanCustomerWA = customerWhatsapp.replace(/\D/g, '');
      // E.g., if one uses 08 and one uses 628, maybe just check the last 8-9 digits.
      const sliceLength = -8; 
      if (cleanTargetWA.slice(sliceLength) !== cleanCustomerWA.slice(sliceLength)) {
        return { valid: false, discountAmount: 0, message: 'Kode promo tidak valid untuk nomor WhatsApp ini.' };
      }
    }

    return { valid: true, discountAmount: promo.discountAmount };
  },

  /**
   * Update the status of a promo code (Admin)
   */
  async updatePromoStatus(id: string, status: PromoCodeStatus): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('promo_codes')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const promos = getMockPromos();
      const index = promos.findIndex(p => p.id === id);
      if (index === -1) return false;
      promos[index].status = status;
      saveMockPromos(promos);
      return true;
    }
  },

  /**
   * Increment usage count, marks as used if max reached (Backend/System)
   */
  async incrementPromoUsage(codeStr: string): Promise<boolean> {
    const code = codeStr.toUpperCase().trim();
    if (!code) return false;

    if (isSupabaseEnabled && supabase) {
      // Typically requires RPC to increment safely, but for simplicity:
      const { data: promo } = await supabase.from('promo_codes').select('*').eq('code', code).single();
      if (!promo) return false;

      const newUsage = (promo.usage_count || 0) + 1;
      const newStatus = newUsage >= promo.max_usage ? 'used' : promo.status;

      const { error } = await supabase
        .from('promo_codes')
        .update({ usage_count: newUsage, status: newStatus })
        .eq('code', code);
        
      return !error;
    } else {
      const promos = getMockPromos();
      const index = promos.findIndex(p => p.code === code);
      if (index === -1) return false;

      promos[index].usageCount += 1;
      if (promos[index].usageCount >= promos[index].maxUsage) {
        promos[index].status = 'used';
      }
      saveMockPromos(promos);
      return true;
    }
  },

  /**
   * Delete promo code (Admin)
   */
  async deletePromoCode(id: string): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      let promos = getMockPromos();
      promos = promos.filter(p => p.id !== id);
      saveMockPromos(promos);
      return true;
    }
  }
};
