/* ============================================
   JSS — Application Constants
   ============================================ */

/** Brand information */
export const BRAND = {
  name: 'Jasa Suruh Kalirejo',
  shortName: 'JSS',
  tagline: 'Mau Nitip Apa Hari Ini?',
  description: 'Layanan antar jemput & titip beli terpercaya di Kecamatan Kalirejo, Lampung Tengah. Cepat, aman, dan terjangkau.',
  phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '62882020705153',
  phoneFormatted: '+62 882-0207-05153',
  email: 'jasasuruhkalirejo@gmail.com',
  instagram: 'jasasuruhkalirejo',
  tiktok: 'jasasuruhkalirejo',
  address: 'Kalirejo, Lampung Tengah, Lampung, Indonesia',
  founded: '2024',
} as const;

/** Navigation links */
export const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Pesan', href: '/order' },
  { label: 'Area Layanan', href: '/coverage' },
  { label: 'Tentang Kami', href: '/about' },
  { label: 'Kontak', href: '/contact' },
] as const;

/** Order categories */
export const ORDER_CATEGORIES = [
  {
    id: 'ride',
    label: 'Ojek (Antar Orang)',
    icon: 'Bike',
    description: 'Antar jemput penumpang cepat',
    color: '#10B981',
  },
  {
    id: 'packages',
    label: 'Paket',
    icon: 'Package',
    description: 'Kirim & ambil paket barang',
    color: '#8B5CF6',
  },
  {
    id: 'food',
    label: 'Makanan',
    icon: 'UtensilsCrossed',
    description: 'Pesan makanan & minuman',
    color: '#FF6B35',
  },
  {
    id: 'shopping',
    label: 'Belanja',
    icon: 'ShoppingBag',
    description: 'Belanja kebutuhan harian',
    color: '#FDB813',
  },
  {
    id: 'medicine',
    label: 'Obat',
    icon: 'Pill',
    description: 'Beli obat dari apotek',
    color: '#10B981',
  },
  {
    id: 'documents',
    label: 'Dokumen',
    icon: 'FileText',
    description: 'Antar dokumen penting',
    color: '#3B82F6',
  },
  {
    id: 'large_cargo',
    label: 'Barang Besar',
    icon: 'Truck',
    description: 'Kirim barang besar/berat',
    color: '#EF4444',
  },
  {
    id: 'carter',
    label: 'Carter Mobil',
    icon: 'Car',
    description: 'Sewa mobil plus sopir',
    color: '#3B82F6',
  },
  {
    id: 'others',
    label: 'Lainnya',
    icon: 'MoreHorizontal',
    description: 'Kebutuhan suruh lainnya',
    color: '#6B7280',
  },
] as const;

/** Pricing configuration */
export const PRICING = {
  baseFee: 5000,         // Base service fee in IDR
  perKmRate: 2800,       // Price per kilometer
  minFee: 5000,          // Minimum delivery fee
  maxFee: 50000,         // Maximum delivery fee
  currency: 'IDR',
} as const;

/** Coverage area coordinates (Kalirejo and surrounding areas) */
export const COVERAGE_AREAS = [
  {
    name: 'Kalirejo',
    description: 'Pusat layanan utama',
    isMain: true,
    lat: -5.2800,
    lng: 104.9838,
    radius: 5,
  },
  {
    name: 'Bangun Rejo',
    description: 'Area layanan',
    isMain: false,
    lat: -5.2700,
    lng: 104.9700,
    radius: 3,
  },
  {
    name: 'Sendang Agung',
    description: 'Area layanan',
    isMain: false,
    lat: -5.2900,
    lng: 105.0000,
    radius: 3,
  },
  {
    name: 'Padang Ratu',
    description: 'Area layanan',
    isMain: false,
    lat: -5.3000,
    lng: 104.9600,
    radius: 3,
  },
  {
    name: 'Srimulyo',
    description: 'Area layanan',
    isMain: false,
    lat: -5.2600,
    lng: 105.0100,
    radius: 2,
  },
  {
    name: 'Kaliwungu',
    description: 'Area layanan',
    isMain: false,
    lat: -5.3100,
    lng: 104.9900,
    radius: 2,
  },
] as const;

/** Center coordinates for map */
export const MAP_CENTER = {
  lat: -5.2800,
  lng: 104.9838,
} as const;

/** Default map zoom */
export const MAP_ZOOM = 15;

/** Order status labels & colors */
export const ORDER_STATUSES = {
  waiting: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700', icon: 'Clock' },
  accepted: { label: 'Diterima', color: 'bg-blue-100 text-blue-700', icon: 'CheckCircle' },
  driver_going: { label: 'Driver Menuju Lokasi', color: 'bg-indigo-100 text-indigo-700', icon: 'Navigation' },
  shopping: { label: 'Sedang Belanja', color: 'bg-purple-100 text-purple-700', icon: 'ShoppingBag' },
  delivering: { label: 'Sedang Diantar', color: 'bg-cyan-100 text-cyan-700', icon: 'Truck' },
  completed: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle2' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: 'XCircle' },
} as const;

/** Payment methods */
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tunai', icon: 'Banknote', description: 'Bayar langsung ke driver' },
  { id: 'qris', label: 'QRIS', icon: 'QrCode', description: 'Scan QRIS untuk pembayaran' },
  { id: 'transfer', label: 'Transfer Bank', icon: 'Building2', description: 'Transfer ke rekening kami' },
] as const;

/** Testimonials data */
export const TESTIMONIALS = [
  {
    name: 'Rina Sulistiani',
    location: 'Kalirejo',
    avatar: 'RS',
    rating: 5,
    text: 'Layanannya cepat banget! Saya nitip belanja dan 30 menit sudah sampai. Sangat membantu ibu-ibu yang sibuk.',
  },
  {
    name: 'Budi Hartono',
    location: 'Bangun Rejo',
    avatar: 'BH',
    rating: 5,
    text: 'Harga ongkir terjangkau dan driver-nya ramah. Sudah jadi langganan untuk kirim dokumen.',
  },
  {
    name: 'Siti Aminah',
    location: 'Sendang Agung',
    avatar: 'SA',
    rating: 5,
    text: 'Sangat terbantu! Tinggal WhatsApp, pesanan langsung diantar. Recommended banget!',
  },
  {
    name: 'Andi Prasetyo',
    location: 'Padang Ratu',
    avatar: 'AP',
    rating: 4,
    text: 'Pelayanan profesional untuk daerah kecamatan. Semoga terus berkembang!',
  },
  {
    name: 'Dewi Lestari',
    location: 'Kalirejo',
    avatar: 'DL',
    rating: 5,
    text: 'Beli obat ke apotek tanpa harus keluar rumah. Sangat praktis dan aman!',
  },
] as const;

/** FAQ data */
export const FAQS = [
  {
    question: 'Bagaimana cara memesan di Jasa Suruh Kalirejo?',
    answer: 'Sangat mudah! Cukup isi form pemesanan di website kami atau langsung hubungi WhatsApp. Isi detail pesanan seperti alamat jemput, tujuan, dan jenis barang yang ingin dikirim.',
  },
  {
    question: 'Berapa tarif pengiriman?',
    answer: 'Tarif pengiriman mulai dari Rp 5.000 dengan harga Rp 2.800/km. Biaya sudah termasuk ongkos jalan dan layanan. Estimasi harga bisa langsung dihitung di halaman pemesanan.',
  },
  {
    question: 'Area mana saja yang dilayani?',
    answer: 'Saat ini kami melayani area Kalirejo dan sekitarnya termasuk Bangun Rejo, Sendang Agung, Padang Ratu, Srimulyo, dan Kaliwungu. Kami terus memperluas jangkauan layanan.',
  },
  {
    question: 'Berapa lama waktu pengiriman?',
    answer: 'Waktu pengiriman tergantung jarak dan jenis pesanan. Untuk area Kalirejo biasanya 15-30 menit. Untuk area sekitar bisa 30-60 menit.',
  },
  {
    question: 'Apakah barang diasuransikan?',
    answer: 'Kami bertanggung jawab penuh atas keamanan barang yang dikirim. Jika terjadi kerusakan atau kehilangan, kami akan mengganti sesuai nilai barang.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima pembayaran tunai (COD), QRIS, dan transfer bank. Pembayaran dilakukan setelah barang sampai di tujuan.',
  },
  {
    question: 'Apakah bisa titip beli makanan?',
    answer: 'Tentu! Kami melayani titip beli makanan, minuman, obat, kebutuhan harian, dokumen, dan paket. Tinggal sebutkan apa yang Anda butuhkan.',
  },
  {
    question: 'Jam operasional Jasa Suruh Kalirejo?',
    answer: 'Kami beroperasi setiap hari mulai pukul 07.00 - 21.00 WIB. Untuk pemesanan di luar jam operasional, silakan hubungi WhatsApp.',
  },
] as const;

/** Features for landing page */
export const FEATURES = [
  {
    icon: 'Zap',
    title: 'Super Cepat',
    description: 'Pesanan Anda diproses dalam hitungan menit. Driver kami siap meluncur kapan saja.',
  },
  {
    icon: 'Shield',
    title: 'Aman & Terpercaya',
    description: 'Barang Anda dijamin aman sampai tujuan. Driver terverifikasi dan bertanggung jawab.',
  },
  {
    icon: 'Wallet',
    title: 'Harga Terjangkau',
    description: 'Tarif transparan mulai Rp 5.000. Tidak ada biaya tersembunyi, harga sesuai jarak.',
  },
  {
    icon: 'MapPin',
    title: 'Jangkauan Luas',
    description: 'Melayani Kalirejo dan sekitarnya. Area layanan terus diperluas untuk kenyamanan Anda.',
  },
  {
    icon: 'Clock',
    title: '07.00 - 21.00 WIB',
    description: 'Layanan tersedia setiap hari dari pagi hingga malam. Siap melayani kebutuhan Anda.',
  },
  {
    icon: 'MessageCircle',
    title: 'Mudah Dipesan',
    description: 'Cukup isi form atau chat WhatsApp. Proses pemesanan cepat dan tidak ribet.',
  },
] as const;

/** How it works steps */
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Isi Form Pesanan',
    description: 'Lengkapi form dengan detail pesanan: alamat, barang, dan catatan tambahan.',
    icon: 'ClipboardList',
  },
  {
    step: 2,
    title: 'Konfirmasi via WhatsApp',
    description: 'Pesanan dikirim otomatis ke WhatsApp admin untuk konfirmasi cepat.',
    icon: 'MessageCircle',
  },
  {
    step: 3,
    title: 'Driver Menuju Lokasi',
    description: 'Driver kami segera berangkat untuk mengambil pesanan Anda.',
    icon: 'Navigation',
  },
  {
    step: 4,
    title: 'Pesanan Diantar',
    description: 'Barang diantar langsung ke tujuan dengan aman dan cepat.',
    icon: 'PackageCheck',
  },
] as const;

/** Stats for landing page */
export const STATS = [
  { label: 'Pesanan Selesai', value: 2500, suffix: '+' },
  { label: 'Pelanggan Puas', value: 1200, suffix: '+' },
  { label: 'Area Layanan', value: 6, suffix: ' Desa' },
  { label: 'Driver Aktif', value: 15, suffix: '+' },
] as const;
