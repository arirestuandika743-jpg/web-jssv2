import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { DepositRequest, Driver } from '@/types';
import { sanitizeObject } from '@/lib/sanitizer';
import { auditLogger } from '@/services/auditLogger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);
const supabase = isSupabaseEnabled ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// Global server-side in-memory storage for deposit requests across all domain origins
declare global {
  var serverDeposits: DepositRequest[] | undefined;
  var serverDrivers: Driver[] | undefined;
}

if (!globalThis.serverDeposits) {
  globalThis.serverDeposits = [];
}

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'jss-admin-secret-2026';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
};

function verifyAdminAuth(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  return adminKey === ADMIN_SECRET || token === ADMIN_SECRET;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courierId = searchParams.get('courierId');

  let list = globalThis.serverDeposits || [];
  if (courierId) {
    list = list.filter((d) => d.courierId === courierId);
  }

  return NextResponse.json({ success: true, deposits: list }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawDeposit: DepositRequest = body.deposit;

    if (!rawDeposit || !rawDeposit.id || !rawDeposit.amount || rawDeposit.amount <= 0) {
      return NextResponse.json({ success: false, error: 'Data deposit tidak valid' }, { status: 400, headers: corsHeaders });
    }

    const deposit: DepositRequest = sanitizeObject(rawDeposit);

    if (!globalThis.serverDeposits) {
      globalThis.serverDeposits = [];
    }

    const existingIdx = globalThis.serverDeposits.findIndex((d) => d.id === deposit.id);
    if (existingIdx !== -1) {
      globalThis.serverDeposits[existingIdx] = deposit;
    } else {
      globalThis.serverDeposits.unshift(deposit);
    }

    auditLogger.log('DEPOSIT_REQUEST', `Pengajuan deposit Rp ${deposit.amount} oleh ${deposit.courierName}`);

    return NextResponse.json(
      { success: true, deposit, totalDeposits: globalThis.serverDeposits.length },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menyimpan pengajuan deposit' }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, requestId, adminName, reason } = body;

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Aksi atau ID pengajuan tidak valid' }, { status: 400, headers: corsHeaders });
    }

    // Security check: Only Admin can approve or reject deposit top-ups
    if (!verifyAdminAuth(request)) {
      auditLogger.log('UNAUTHORIZED_DEPOSIT_APPROVAL', 'Upaya verifikasi deposit tanpa autentikasi admin', {
        requestId,
        action,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Verifikasi deposit membutuhkan otorisasi Admin resmi.' },
        { status: 403, headers: corsHeaders }
      );
    }

    const sanitizedAdminName = adminName ? String(adminName).substring(0, 100) : 'Admin JSS';
    const sanitizedReason = reason ? String(reason).substring(0, 200) : 'Bukti transfer tidak valid';

    // Handle Supabase update if enabled on server
    if (isSupabaseEnabled && supabase) {
      try {
        if (action === 'approve') {
          // Try RPC first
          const { data: rpcSuccess, error: rpcError } = await supabase.rpc('approve_deposit', {
            p_request_id: requestId,
            p_admin_name: sanitizedAdminName,
          });

          if (rpcError || rpcSuccess === null) {
            console.warn('API route approve_deposit RPC failed/not found, falling back:', rpcError);
            // Fallback JS query
            const { data: dbReq } = await supabase.from('deposit_requests').select('*').eq('id', requestId).single();

            if (dbReq && dbReq.status === 'pending') {
              await supabase
                .from('deposit_requests')
                .update({
                  status: 'approved',
                  verified_by: sanitizedAdminName,
                  verified_at: new Date().toISOString(),
                })
                .eq('id', requestId);

              // Get driver balance
              const { data: dbDriver } = await supabase
                .from('drivers')
                .select('balance')
                .eq('id', dbReq.courier_id)
                .maybeSingle();

              const current = dbDriver ? Number(dbDriver.balance) : 0;
              const newBal = current + Number(dbReq.amount);

              await supabase.from('drivers').upsert(
                {
                  id: dbReq.courier_id,
                  name: dbReq.courier_name || 'Kurir JSS',
                  phone: dbReq.courier_phone || '081234567890',
                  balance: newBal,
                },
                { onConflict: 'id' }
              );
            }
          }
        } else if (action === 'reject') {
          await supabase
            .from('deposit_requests')
            .update({
              status: 'rejected',
              rejection_reason: sanitizedReason,
              verified_by: sanitizedAdminName,
              verified_at: new Date().toISOString(),
            })
            .eq('id', requestId);
        }
      } catch (err) {
        console.error('API route Supabase PATCH error:', err);
      }
    }

    if (!globalThis.serverDeposits) {
      globalThis.serverDeposits = [];
    }

    const depIdx = globalThis.serverDeposits.findIndex((d) => d.id === requestId);
    if (depIdx === -1) {
      return NextResponse.json({ success: false, error: 'Pengajuan deposit tidak ditemukan' }, { status: 404, headers: corsHeaders });
    }

    const req = globalThis.serverDeposits[depIdx];
    if (action === 'approve') {
      req.status = 'approved';
      req.verifiedAt = new Date().toISOString();
      req.verifiedBy = sanitizedAdminName;
    } else if (action === 'reject') {
      req.status = 'rejected';
      req.rejectionReason = sanitizedReason;
      req.verifiedAt = new Date().toISOString();
      req.verifiedBy = sanitizedAdminName;
    }

    globalThis.serverDeposits[depIdx] = req;

    auditLogger.log('DEPOSIT_VERIFIED', `Deposit ${req.referenceNumber} ${action === 'approve' ? 'DISETUJUI' : 'DITOLAK'} oleh ${sanitizedAdminName}`);

    return NextResponse.json({ success: true, deposit: req }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memproses verifikasi deposit' }, { status: 500, headers: corsHeaders });
  }
}
