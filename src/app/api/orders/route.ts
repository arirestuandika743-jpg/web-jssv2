import { NextResponse } from 'next/server';
import type { Order } from '@/types';

// Global server-side in-memory storage for orders across all domain origins
declare global {
  var serverOrders: Order[] | undefined;
}

if (!globalThis.serverOrders) {
  globalThis.serverOrders = [];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
    const order: Order = body.order;
    if (!order || !order.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!globalThis.serverOrders) {
      globalThis.serverOrders = [];
    }

    const existingIndex = globalThis.serverOrders.findIndex(o => o.id === order.id);
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
      { success: false, error: 'Failed to save order' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, driverId, driverName } = body;

    if (!globalThis.serverOrders) {
      globalThis.serverOrders = [];
    }

    const orderIdx = globalThis.serverOrders.findIndex(o => o.id === orderId);
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
      { success: false, error: 'Order not found' },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE() {
  globalThis.serverOrders = [];
  return NextResponse.json(
    { success: true, message: 'All orders reset on server' },
    { headers: corsHeaders }
  );
}
