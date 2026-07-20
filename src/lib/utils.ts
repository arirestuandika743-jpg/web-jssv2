import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as Indonesian Rupiah */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format distance in km */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km < 1
    ? `${Math.round(meters)} m`
    : `${km.toFixed(1)} km`;
}

/** Format duration in minutes */
export function formatDuration(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} jam ${remainingMinutes} menit`;
}

/** Generate WhatsApp URL with pre-filled message */
export function generateWhatsAppUrl(params: {
  phone: string;
  name: string;
  whatsapp: string;
  pickup: string;
  destination: string;
  distance: string;
  fee: string;
  category: string;
  notes: string;
  orderNumber?: string;
}): string {
  const orderLine = params.orderNumber ? `\n🆔 *No. Pesanan:* ${params.orderNumber}` : '';
  const message = `Halo Admin Jasa Suruh Kalirejo 👋

📋 *PESANAN BARU*${orderLine}

👤 Nama: ${params.name}
📱 Nomor: ${params.whatsapp}
📍 Pickup: ${params.pickup}
🏁 Tujuan: ${params.destination}
📏 Jarak: ${params.distance}
💰 Ongkir: ${params.fee}
📦 Kategori: ${params.category}
📝 Catatan: ${params.notes || '-'}

Terima kasih! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${params.phone}?text=${encodedMessage}`;
}

/** Delay utility for animations */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Truncate text */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
