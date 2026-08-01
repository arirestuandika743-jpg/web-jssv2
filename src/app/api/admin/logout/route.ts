import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST() {
  const response = NextResponse.json(
    { success: true, redirectUrl: '/admin/login' },
    { status: 200 }
  );

  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
