'use client';

import { createClient } from '@/lib/supabase';
import { isSupabaseEnabled } from './auth';
import type { User } from '@/types';

const supabase = isSupabaseEnabled ? createClient() : null;

const MOCK_REFERRALS_KEY = 'jss_mock_referrals';
const MOCK_PROMO_CAMPAIGNS_KEY = 'jss_mock_promo_campaigns';
const MOCK_PROMO_TRANSACTIONS_KEY = 'jss_mock_promo_transactions';
const MOCK_USERS_KEY = 'jss_mock_users';

// ============================================
// Types
// ============================================

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  status: 'pending' | 'completed' | 'rewarded';
  referrerReward: number;
  referredDiscountPercent: number;
  referredMaxDiscount: number;
  firstOrderId?: string;
  createdAt: string;
  completedAt?: string;
  // Joined fields
  referrerName?: string;
  referredName?: string;
  referredPhone?: string;
}

export interface PromoCampaign {
  id: string;
  type: 'new_user' | 'referral';
  isActive: boolean;
  discountPercent: number;
  maxDiscount: number;
  referralReward: number;
  startDate?: string;
  endDate?: string;
  maxReferralsPerUser: number;
  totalNewUsers: number;
  totalReferrals: number;
  totalDiscountGiven: number;
  totalRewardsGiven: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit_referral' | 'debit_order' | 'credit_admin' | 'debit_admin';
  description: string;
  orderId?: string;
  referralId?: string;
  balanceAfter: number;
  createdAt: string;
}

// ============================================
// Helpers
// ============================================

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

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'JSS-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Default campaigns
const DEFAULT_CAMPAIGNS: PromoCampaign[] = [
  {
    id: 'campaign-new-user',
    type: 'new_user',
    isActive: true,
    discountPercent: 20,
    maxDiscount: 10000,
    referralReward: 0,
    maxReferralsPerUser: 0,
    totalNewUsers: 0,
    totalReferrals: 0,
    totalDiscountGiven: 0,
    totalRewardsGiven: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'campaign-referral',
    type: 'referral',
    isActive: true,
    discountPercent: 20,
    maxDiscount: 10000,
    referralReward: 5000,
    maxReferralsPerUser: 50,
    totalNewUsers: 0,
    totalReferrals: 0,
    totalDiscountGiven: 0,
    totalRewardsGiven: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================
// Referral Service
// ============================================

export const referralService = {
  // ============================
  // REFERRAL CODE
  // ============================

  /** Get or generate referral code for a user */
  async getReferralCode(userId: string): Promise<string> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();
      if (data?.referral_code) return data.referral_code;
      // Generate if missing
      const code = generateReferralCode();
      await supabase.from('profiles').update({ referral_code: code }).eq('id', userId);
      return code;
    } else {
      const users = getMock<any>(MOCK_USERS_KEY);
      const user = users.find((u: any) => u.id === userId);
      if (user?.referralCode) return user.referralCode;
      const code = generateReferralCode();
      if (user) {
        user.referralCode = code;
        setMock(MOCK_USERS_KEY, users);
      }
      return code;
    }
  },

  /** Get referral link */
  getReferralLink(code: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jasa-suruh-kalirejo.vercel.app';
    return `${baseUrl}/register?ref=${code}`;
  },

  // ============================
  // REGISTER WITH REFERRAL
  // ============================

  /** Process referral on registration */
  async processReferralOnRegister(newUserId: string, referralCode: string): Promise<boolean> {
    if (!referralCode) return false;

    // Find referrer by code
    let referrerId: string | null = null;

    if (isSupabaseEnabled && supabase) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode.toUpperCase())
        .single();
      if (!referrer) return false;
      referrerId = referrer.id;
    } else {
      const users = getMock<any>(MOCK_USERS_KEY);
      const referrer = users.find((u: any) => u.referralCode === referralCode.toUpperCase());
      if (!referrer) return false;
      referrerId = referrer.id;
    }

    // Anti-fraud: Cannot refer self
    if (referrerId === newUserId) return false;

    // Check if already referred
    const existingReferrals = await this.getReferralsByReferred(newUserId);
    if (existingReferrals.length > 0) return false;

    // Create referral record
    const campaign = await this.getCampaign('referral');
    if (!campaign || !campaign.isActive) return false;

    const referral: Referral = {
      id: genId(),
      referrerId: referrerId!,
      referredId: newUserId,
      status: 'pending',
      referrerReward: campaign.referralReward,
      referredDiscountPercent: campaign.discountPercent,
      referredMaxDiscount: campaign.maxDiscount,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseEnabled && supabase) {
      await supabase.from('referrals').insert({
        id: referral.id,
        referrer_id: referral.referrerId,
        referred_id: referral.referredId,
        status: referral.status,
        referrer_reward: referral.referrerReward,
        referred_discount_percent: referral.referredDiscountPercent,
        referred_max_discount: referral.referredMaxDiscount,
      });
      // Mark user as referred
      await supabase.from('profiles').update({ referred_by: referralCode }).eq('id', newUserId);
    } else {
      const referrals = getMock<Referral>(MOCK_REFERRALS_KEY);
      referrals.push(referral);
      setMock(MOCK_REFERRALS_KEY, referrals);
    }

    return true;
  },

  // ============================
  // COMPLETE REFERRAL (on first order completion)
  // ============================

  /** Complete referral and give rewards after first order */
  async completeReferralOnFirstOrder(customerId: string, orderId: string): Promise<boolean> {
    // Find pending referral for this customer
    const referrals = await this.getReferralsByReferred(customerId);
    const pendingReferral = referrals.find(r => r.status === 'pending');
    if (!pendingReferral) return false;

    const campaign = await this.getCampaign('referral');
    if (!campaign || !campaign.isActive) return false;

    if (isSupabaseEnabled && supabase) {
      // Update referral status
      await supabase.from('referrals').update({
        status: 'rewarded',
        first_order_id: orderId,
        completed_at: new Date().toISOString(),
      }).eq('id', pendingReferral.id);

      // Credit referrer's promo balance
      const { data: referrer } = await supabase
        .from('profiles')
        .select('promo_balance')
        .eq('id', pendingReferral.referrerId)
        .single();

      const newBalance = (referrer?.promo_balance || 0) + pendingReferral.referrerReward;
      await supabase.from('profiles').update({ promo_balance: newBalance }).eq('id', pendingReferral.referrerId);

      // Record transaction
      await supabase.from('promo_transactions').insert({
        user_id: pendingReferral.referrerId,
        amount: pendingReferral.referrerReward,
        type: 'credit_referral',
        description: `Referral berhasil - teman menyelesaikan order pertama`,
        order_id: orderId,
        referral_id: pendingReferral.id,
        balance_after: newBalance,
      });

      // Mark referred user's first order as completed
      await supabase.from('profiles').update({ first_order_completed: true }).eq('id', customerId);

      // Update campaign stats
      await supabase.from('promo_campaigns')
        .update({
          total_referrals: campaign.totalReferrals + 1,
          total_rewards_given: campaign.totalRewardsGiven + pendingReferral.referrerReward,
          updated_at: new Date().toISOString(),
        })
        .eq('type', 'referral');
    } else {
      // Mock implementation
      const allReferrals = getMock<Referral>(MOCK_REFERRALS_KEY);
      const idx = allReferrals.findIndex(r => r.id === pendingReferral.id);
      if (idx !== -1) {
        allReferrals[idx].status = 'rewarded';
        allReferrals[idx].firstOrderId = orderId;
        allReferrals[idx].completedAt = new Date().toISOString();
        setMock(MOCK_REFERRALS_KEY, allReferrals);
      }

      // Credit referrer balance
      const users = getMock<any>(MOCK_USERS_KEY);
      const referrer = users.find((u: any) => u.id === pendingReferral.referrerId);
      if (referrer) {
        referrer.promoBalance = (referrer.promoBalance || 0) + pendingReferral.referrerReward;
        setMock(MOCK_USERS_KEY, users);
      }

      // Record transaction
      const transactions = getMock<PromoTransaction>(MOCK_PROMO_TRANSACTIONS_KEY);
      transactions.push({
        id: genId(),
        userId: pendingReferral.referrerId,
        amount: pendingReferral.referrerReward,
        type: 'credit_referral',
        description: 'Referral berhasil - teman menyelesaikan order pertama',
        orderId,
        referralId: pendingReferral.id,
        balanceAfter: (referrer?.promoBalance || 0) + pendingReferral.referrerReward,
        createdAt: new Date().toISOString(),
      });
      setMock(MOCK_PROMO_TRANSACTIONS_KEY, transactions);
    }

    return true;
  },

  // ============================
  // QUERIES
  // ============================

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('referrals')
        .select('*, referred:profiles!referred_id(name, phone)')
        .eq('referrer_id', referrerId)
        .order('created_at', { ascending: false });
      return (data || []).map((r: any) => ({
        id: r.id,
        referrerId: r.referrer_id,
        referredId: r.referred_id,
        status: r.status,
        referrerReward: Number(r.referrer_reward),
        referredDiscountPercent: r.referred_discount_percent,
        referredMaxDiscount: Number(r.referred_max_discount),
        firstOrderId: r.first_order_id,
        createdAt: r.created_at,
        completedAt: r.completed_at,
        referredName: r.referred?.name,
        referredPhone: r.referred?.phone,
      }));
    } else {
      return getMock<Referral>(MOCK_REFERRALS_KEY).filter(r => r.referrerId === referrerId);
    }
  },

  async getReferralsByReferred(referredId: string): Promise<Referral[]> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', referredId);
      return (data || []).map((r: any) => ({
        id: r.id,
        referrerId: r.referrer_id,
        referredId: r.referred_id,
        status: r.status,
        referrerReward: Number(r.referrer_reward),
        referredDiscountPercent: r.referred_discount_percent,
        referredMaxDiscount: Number(r.referred_max_discount),
        firstOrderId: r.first_order_id,
        createdAt: r.created_at,
        completedAt: r.completed_at,
      }));
    } else {
      return getMock<Referral>(MOCK_REFERRALS_KEY).filter(r => r.referredId === referredId);
    }
  },

  // ============================
  // PROMO BALANCE
  // ============================

  async getPromoBalance(userId: string): Promise<number> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('promo_balance')
        .eq('id', userId)
        .single();
      return Number(data?.promo_balance || 0);
    } else {
      const users = getMock<any>(MOCK_USERS_KEY);
      const user = users.find((u: any) => u.id === userId);
      return user?.promoBalance || 0;
    }
  },

  async usePromoBalance(userId: string, amount: number, orderId: string): Promise<boolean> {
    const balance = await this.getPromoBalance(userId);
    if (balance < amount) return false;

    const newBalance = balance - amount;

    if (isSupabaseEnabled && supabase) {
      await supabase.from('profiles').update({ promo_balance: newBalance }).eq('id', userId);
      await supabase.from('promo_transactions').insert({
        user_id: userId,
        amount: -amount,
        type: 'debit_order',
        description: `Digunakan untuk order`,
        order_id: orderId,
        balance_after: newBalance,
      });
    } else {
      const users = getMock<any>(MOCK_USERS_KEY);
      const user = users.find((u: any) => u.id === userId);
      if (user) {
        user.promoBalance = newBalance;
        setMock(MOCK_USERS_KEY, users);
      }
      const transactions = getMock<PromoTransaction>(MOCK_PROMO_TRANSACTIONS_KEY);
      transactions.push({
        id: genId(),
        userId,
        amount: -amount,
        type: 'debit_order',
        description: 'Digunakan untuk order',
        orderId,
        balanceAfter: newBalance,
        createdAt: new Date().toISOString(),
      });
      setMock(MOCK_PROMO_TRANSACTIONS_KEY, transactions);
    }

    return true;
  },

  async getPromoTransactions(userId: string): Promise<PromoTransaction[]> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('promo_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return (data || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        orderId: t.order_id,
        referralId: t.referral_id,
        balanceAfter: Number(t.balance_after),
        createdAt: t.created_at,
      }));
    } else {
      return getMock<PromoTransaction>(MOCK_PROMO_TRANSACTIONS_KEY)
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  // ============================
  // NEW USER PROMO
  // ============================

  async isNewUserPromoEligible(userId: string): Promise<boolean> {
    const campaign = await this.getCampaign('new_user');
    if (!campaign || !campaign.isActive) return false;

    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('is_new_user_promo_used, first_order_completed')
        .eq('id', userId)
        .single();
      return data ? (!data.is_new_user_promo_used && !data.first_order_completed) : false;
    } else {
      const users = getMock<any>(MOCK_USERS_KEY);
      const user = users.find((u: any) => u.id === userId);
      return user ? (!user.isNewUserPromoUsed && !user.firstOrderCompleted) : false;
    }
  },

  async calculateNewUserDiscount(userId: string, orderTotal: number): Promise<number> {
    const eligible = await this.isNewUserPromoEligible(userId);
    if (!eligible) return 0;

    const campaign = await this.getCampaign('new_user');
    if (!campaign) return 0;

    const discountAmount = Math.floor(orderTotal * (campaign.discountPercent / 100));
    return Math.min(discountAmount, campaign.maxDiscount);
  },

  async markNewUserPromoUsed(userId: string): Promise<void> {
    if (isSupabaseEnabled && supabase) {
      await supabase.from('profiles').update({
        is_new_user_promo_used: true,
        first_order_completed: true,
      }).eq('id', userId);
    } else {
      const users = getMock<any>(MOCK_USERS_KEY);
      const user = users.find((u: any) => u.id === userId);
      if (user) {
        user.isNewUserPromoUsed = true;
        user.firstOrderCompleted = true;
        setMock(MOCK_USERS_KEY, users);
      }
    }
  },

  // ============================
  // CAMPAIGNS (Admin)
  // ============================

  async getCampaign(type: 'new_user' | 'referral'): Promise<PromoCampaign | null> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('promo_campaigns')
        .select('*')
        .eq('type', type)
        .single();
      if (!data) return null;
      return {
        id: data.id,
        type: data.type,
        isActive: data.is_active,
        discountPercent: data.discount_percent,
        maxDiscount: Number(data.max_discount),
        referralReward: Number(data.referral_reward),
        startDate: data.start_date,
        endDate: data.end_date,
        maxReferralsPerUser: data.max_referrals_per_user,
        totalNewUsers: data.total_new_users,
        totalReferrals: data.total_referrals,
        totalDiscountGiven: Number(data.total_discount_given),
        totalRewardsGiven: Number(data.total_rewards_given),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      const campaigns = getMock<PromoCampaign>(MOCK_PROMO_CAMPAIGNS_KEY);
      if (campaigns.length === 0) {
        setMock(MOCK_PROMO_CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
        return DEFAULT_CAMPAIGNS.find(c => c.type === type) || null;
      }
      return campaigns.find(c => c.type === type) || null;
    }
  },

  async getAllCampaigns(): Promise<PromoCampaign[]> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('promo_campaigns')
        .select('*')
        .order('type');
      return (data || []).map((d: any) => ({
        id: d.id,
        type: d.type,
        isActive: d.is_active,
        discountPercent: d.discount_percent,
        maxDiscount: Number(d.max_discount),
        referralReward: Number(d.referral_reward),
        startDate: d.start_date,
        endDate: d.end_date,
        maxReferralsPerUser: d.max_referrals_per_user,
        totalNewUsers: d.total_new_users,
        totalReferrals: d.total_referrals,
        totalDiscountGiven: Number(d.total_discount_given),
        totalRewardsGiven: Number(d.total_rewards_given),
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } else {
      const campaigns = getMock<PromoCampaign>(MOCK_PROMO_CAMPAIGNS_KEY);
      if (campaigns.length === 0) {
        setMock(MOCK_PROMO_CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
        return DEFAULT_CAMPAIGNS;
      }
      return campaigns;
    }
  },

  async updateCampaign(id: string, updates: Partial<PromoCampaign>): Promise<boolean> {
    if (isSupabaseEnabled && supabase) {
      const supabaseUpdates: Record<string, any> = {};
      if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;
      if (updates.discountPercent !== undefined) supabaseUpdates.discount_percent = updates.discountPercent;
      if (updates.maxDiscount !== undefined) supabaseUpdates.max_discount = updates.maxDiscount;
      if (updates.referralReward !== undefined) supabaseUpdates.referral_reward = updates.referralReward;
      if (updates.startDate !== undefined) supabaseUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) supabaseUpdates.end_date = updates.endDate;
      if (updates.maxReferralsPerUser !== undefined) supabaseUpdates.max_referrals_per_user = updates.maxReferralsPerUser;
      supabaseUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase.from('promo_campaigns').update(supabaseUpdates).eq('id', id);
      return !error;
    } else {
      const campaigns = getMock<PromoCampaign>(MOCK_PROMO_CAMPAIGNS_KEY);
      const idx = campaigns.findIndex(c => c.id === id);
      if (idx === -1) return false;
      Object.assign(campaigns[idx], updates, { updatedAt: new Date().toISOString() });
      setMock(MOCK_PROMO_CAMPAIGNS_KEY, campaigns);
      return true;
    }
  },

  // ============================
  // ADMIN: Referral stats
  // ============================

  async getAllReferrals(): Promise<Referral[]> {
    if (isSupabaseEnabled && supabase) {
      const { data } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrer_id(name),
          referred:profiles!referred_id(name, phone)
        `)
        .order('created_at', { ascending: false });
      return (data || []).map((r: any) => ({
        id: r.id,
        referrerId: r.referrer_id,
        referredId: r.referred_id,
        status: r.status,
        referrerReward: Number(r.referrer_reward),
        referredDiscountPercent: r.referred_discount_percent,
        referredMaxDiscount: Number(r.referred_max_discount),
        firstOrderId: r.first_order_id,
        createdAt: r.created_at,
        completedAt: r.completed_at,
        referrerName: r.referrer?.name,
        referredName: r.referred?.name,
        referredPhone: r.referred?.phone,
      }));
    } else {
      return getMock<Referral>(MOCK_REFERRALS_KEY);
    }
  },
};
