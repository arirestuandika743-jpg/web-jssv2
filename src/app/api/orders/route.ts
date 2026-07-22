import { NextResponse } from 'next/server';
import type { Order } from '@/types';
import { sanitizeObject, containsSqlInjection } from '@/lib/sanitizer';
import { auditLogger } from '@/services/auditLogger';

// Global server-side in-memory storage for orders across all domain origins
declare global {
  var serverOrders: Order[] | undefined;
}

if (!globalThis.serverOrders) {
  globalThis.serverOrders = [];
}

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'jss-admin-secret-2026';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      orders: globalThis.serverOrders || [],
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawOrder = body.order;

    if (!rawOrder || !rawOrder.id) {
      return NextResponse.json(
        { success: false, error: 'Order data tidak valid' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Anti-XSS & SQL Injection check
    const orderStringified = JSON.stringify(rawOrder);
    if (containsSqlInjection(orderStringified)) {
      auditLogger.log('SECURITY_ALERT', 'SQL Injection attempt detected in POST /api/orders', { rawOrder });
      return NextResponse.json(
        { success: false, error: 'Muatan data terdeteksi memiliki karakter berbahaya.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Deep sanitize object fields
    const order: Order = sanitizeObject(rawOrder);

    if (!globalThis.serverOrders) {
      globalThis.serverOrders = [];
    }

    const existingIndex = globalThis.serverOrders.findIndex((o) => o.id === order.id);
    if (existingIndex !== -1) {
      globalThis.serverOrders[existingIndex] = order;
    } else {
      globalThis.serverOrders.unshift(order);
    }

    return NextResponse.json(
      {
        success: true,
        order,
        totalOrders: globalThis.serverOrders.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pesanan' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, driverId, driverName } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'ID Pesanan wajib diisi' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!globalThis.serverOrders) {
      globalThis.serverOrders = [];
    }

    const orderIdx = globalThis.serverOrders.findIndex((o) => o.id === orderId);
    if (orderIdx !== -1) {
      if (status) globalThis.serverOrders[orderIdx].status = status;
      if (driverId) globalThis.serverOrders[orderIdx].driverId = driverId;
      if (driverName) globalThis.serverOrders[orderIdx].driverName = driverName;
      globalThis.serverOrders[orderIdx].updatedAt = new Date().toISOString();

      return NextResponse.json(
        { success: true, order: globalThis.serverOrders[orderIdx] },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Pesanan tidak ditemukan' },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui pesanan' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request) {
  // CRITICAL SECURITY ENFORCEMENT: Only authenticated Admin requests with valid secret key can clear orders
  if (!verifyAdminAuth(request)) {
    auditLogger.log('UNAUTHORIZED_DELETE_ATTEMPT', 'Upaya penghapusan masal pesanan tanpa izin admin', {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: Membutuhkan otorisasi Admin resmi.' },
      { status: 403, headers: corsHeaders }
    );
  }

  globalThis.serverOrders = [];
  auditLogger.log('ADMIN_ACTION', 'Mereset seluruh pesanan di server');
  return NextResponse.json(
    { success: true, message: 'Seluruh pesanan berhasil direset oleh Admin' },
    { headers: corsHeaders }
  );
}
