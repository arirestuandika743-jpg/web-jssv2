import { NextResponse } from 'next/server';
import type { DepositRequest, Driver } from '@/types';

// Global server-side in-memory storage for deposit requests across all domain origins
declare global {
  var serverDeposits: DepositRequest[] | undefined;
  var serverDrivers: Driver[] | undefined;
}

if (!globalThis.serverDeposits) {
  globalThis.serverDeposits = [];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courierId = searchParams.get('courierId');

  let list = globalThis.serverDeposits || [];
  if (courierId) {
    list = list.filter(d => d.courierId === courierId);
  }

  return NextResponse.json(
    { success: true, deposits: list },
    { headers: corsHeaders }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deposit: DepositRequest = body.deposit;

    if (!deposit || !deposit.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid deposit data' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!globalThis.serverDeposits) {
      globalThis.serverDeposits = [];
    }

    const existingIdx = globalThis.serverDeposits.findIndex(d => d.id === deposit.id);
    if (existingIdx !== -1) {
      globalThis.serverDeposits[existingIdx] = deposit;
    } else {
      globalThis.serverDeposits.unshift(deposit);
    }

    return NextResponse.json(
      { success: true, deposit, totalDeposits: globalThis.serverDeposits.length },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save deposit request' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, requestId, adminName, reason } = body;

    if (!globalThis.serverDeposits) {
      globalThis.serverDeposits = [];
    }

    const depIdx = globalThis.serverDeposits.findIndex(d => d.id === requestId);
    if (depIdx === -1) {
      return NextResponse.json(
        { success: false, error: 'Deposit request not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const req = globalThis.serverDeposits[depIdx];
    if (action === 'approve') {
      req.status = 'approved';
      req.verifiedAt = new Date().toISOString();
      req.verifiedBy = adminName || 'Admin JSS';
    } else if (action === 'reject') {
      req.status = 'rejected';
      req.rejectionReason = reason || 'Bukti transfer tidak valid';
      req.verifiedAt = new Date().toISOString();
      req.verifiedBy = adminName || 'Admin JSS';
    }

    globalThis.serverDeposits[depIdx] = req;

    return NextResponse.json(
      { success: true, deposit: req },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process deposit request' },
      { status: 500, headers: corsHeaders }
    );
  }
}
