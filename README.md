# JSS — Jasa Suruh Kalirejo 🚀

> **Platform Layanan Antar Jemput & Titip Beli Modern #1 di Kecamatan Kalirejo, Lampung Tengah.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Navigation-74b666?style=flat-square&logo=openstreetmap)](https://www.openstreetmap.org/)

---

## 📖 Deskripsi Singkat

**JSS (Jasa Suruh Kalirejo)** adalah aplikasi web transportasi dan kurir terpadu yang dirancang khusus untuk warga Kalirejo dan sekitarnya di Lampung Tengah. Aplikasi ini memfasilitasi pesanan antar jemput penumpang (Ojek), belanja harian, kirim makanan/obat, antar paket & dokumen, kargo barang besar, hingga carter mobil.

Aplikasi ini menggunakan teknologi **Next.js App Router**, **Glassmorphism UI**, **OpenStreetMap & OSRM Engine** untuk kalkulasi jarak & tarif presisi, serta dukungan **Dual-Mode System** (Kombinasi Supabase Cloud DB dengan fallback LocalStorage Mock).

---

## 🌟 Fitur Utama

- 🛵 **8 Kategori Layanan**: Ojek (Antar Orang), Belanja Harian, Makanan, Obat, Dokumentasi, Paket, Kargo, dan Carter Mobil.
- 🔄 **Ojek PP (Pulang Pergi)**: Otomatis menghitung tarif 2x untuk perjalanan PP (Round Trip).
- 📍 **Peta OpenStreetMap & Geocoding**: Autocomplete alamat presisi Nominatim dengan integrasi OSRM Routing Engine.
- 💰 **Dynamic Pricing Engine**: Kalkulasi biaya berbasis jarak nyata, berat barang, jumlah item, waktu tunggu, dan faktor cuaca.
- 📱 **WhatsApp Order Dispatching**: Format pesan pesanan otomatis dan terstruktur langsung ke WhatsApp Admin/Driver JSS.
- 🛡️ **Cyber Security & OWASP Top 10 Suite**:
  - Helmet & Security HTTP Headers (Strict CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff).
  - Rate Limiter Sliding Window (60 req/min).
  - Proteksi Anti-XSS, Anti-SQLi, dan Perbaikan SSRF pada resolving link peta.
  - File Upload Validation (Max 5MB & image MIME validation).
  - Audit Logger terstruktur.
- 👥 **Role-Based Access Control (4 Tier RBAC)**:
  - `customer`: Pelanggan (Pesan, Lacak, Profil, Riwayat Alamat).
  - `runner`: Driver/Kurir (Tugas antar, Status GPS).
  - `admin`: Admin Operasional (Kelola Pesanan, Driver, Customer).
  - `super_admin`: System Owner (Akses Penuh Pengaturan Sistem).
- ⚡ **Optimasi Performa & SEO > 95**:
  - Lazy Loading Leaflet Maps (`next/dynamic`).
  - Schema.org JSON-LD Structured Data (`LocalBusiness` & `DeliveryService`).
  - Aksesibilitas (`Skip to main content` & landmark ARIA).
  - In-Memory OSRM Route Caching.

---

## 🛠️ Teknologi & Tools

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Maps & Navigasi**: Leaflet.js, React-Leaflet, OpenStreetMap, Nominatim API, OSRM Routing Engine.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth, Storage).
- **Keamanan**: Custom Middleware, Sliding Window Rate Limiter, Helmet Security Headers, Input Sanitizer, Audit Logger.

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js versi 18.x atau lebih baru.
- npm / yarn / pnpm.

### 2. Clone Repositori
```bash
git clone https://github.com/username/web-jss.git
cd web-jss
```

### 3. Install Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=62882020705153
```

> **Catatan**: Jika Supabase URL tidak diisi, aplikasi secara otomatis berjalan dalam mode **LocalStorage Mock**, sehingga Anda tetap dapat menguji seluruh fitur tanpa setup database online!

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🗄️ Migrasi Database Supabase

Jika ingin menghubungkan ke Supabase Cloud:
1. Buka dashboard proyek Supabase Anda.
2. Masuk ke menu **SQL Editor**.
3. Buka file [`supabase/schema.sql`](file:///c:/Users/arire/Documents/web%20jss/supabase/schema.sql) di repositori ini, salin seluruh kodenya dan jalankan (Run) pada Supabase SQL Editor.
4. Seluruh tabel (`profiles`, `drivers`, `orders`, `saved_addresses`, `tracking_updates`, `payments`), RLS policies, trigger `handle_new_user()`, dan storage bucket (`order-photos`, `avatars`) akan otomatis terbuat.

---

## 🔑 Akun Pengujian Default (Mode Dev/Mock)

| Peran | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@email.com` | `superadmin123` |
| **Admin** | `admin@email.com` | `admin123` |
| **Runner / Driver** | `runner@email.com` | `runner123` |
| **Customer** | `rina@email.com` | `rina123` |

---

## 📦 Build Produksi

Untuk menguji kompilasi paket produksi:
```bash
npm run build
npm run start
```

---

## 📄 Lisensi

Hak Cipta © 2026 **Jasa Suruh Kalirejo (JSS)**. Seluruh Hak Dilindungi Undang-Undang.
