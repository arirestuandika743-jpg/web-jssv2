import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderForm } from '@/components/order/OrderForm';

export const metadata: Metadata = {
  title: 'Pesan Sekarang',
  description: 'Pesan layanan antar jemput & titip beli di Kecamatan Kalirejo. Isi form, pilih kategori, dan kirim pesanan via WhatsApp.',
};

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-outfit">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Memuat Formulir Pesanan...</p>
          </div>
        </div>
      }
    >
      <OrderForm />
    </Suspense>
  );
}

