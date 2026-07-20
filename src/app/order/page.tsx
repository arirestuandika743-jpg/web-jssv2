import type { Metadata } from 'next';
import { OrderForm } from '@/components/order/OrderForm';

export const metadata: Metadata = {
  title: 'Pesan Sekarang',
  description: 'Pesan layanan antar jemput & titip beli di Kecamatan Kalirejo. Isi form, pilih kategori, dan kirim pesanan via WhatsApp.',
};

export default function OrderPage() {
  return <OrderForm />;
}
