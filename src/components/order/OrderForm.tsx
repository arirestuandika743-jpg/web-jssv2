'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  MapPin,
  Navigation,
  ShoppingBag,
  UtensilsCrossed,
  Pill,
  FileText,
  Package,
  MoreHorizontal,
  Camera,
  StickyNote,
  Banknote,
  QrCode,
  Building2,
  MessageCircle,
  Calculator,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Trash2,
  Plus,
  CloudRain,
  Clock,
  Bike,
  Car,
  Compass,
  Maximize2,
  Ruler,
  Shield,
  HelpCircle,
  Percent,
  Check,
  Calendar,
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';
import { ORDER_CATEGORIES, PAYMENT_METHODS, BRAND, MAP_CENTER } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { formatCurrency, formatDistance, formatDuration, cn } from '@/lib/utils';
import { usePriceCalculation } from '@/hooks/usePriceCalculation';
import { isWithinLampung, parseNominatimAddress, reverseGeocodeWithCache, inferKecamatan, formatDetailedAddress, geocodeAddressText, parseGoogleMapsCoordinates, type DetailedAddress } from '@/services/maps';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { OrderCategory, PaymentMethod, LatLng, ShoppingItem } from '@/types';

const KECAMATAN_OPTIONS = [
  'Kalirejo',
  'Sendang Agung',
  'Bangunrejo',
  'Padang Ratu',
  'Pubian',
  'Anak Tuha',
  'Bekri',
  'Gunung Sugih',
  'Terbanggi Besar',
  'Trimurjo',
  'Punggur',
  'Kota Gajah',
  'Seputih Raman',
  'Seputih Banyak',
  'Rumbia',
  'Sukoharjo',
  'Adiluwih',
  'Pringsewu',
  'Gadingrejo',
  'Negeri Katon',
  'Metro',
  'Bandar Lampung',
];

const OrderMapPreview = dynamic(
  () => import('./OrderMapPreview').then((mod) => mod.OrderMapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-2xl bg-secondary-100 animate-pulse flex items-center justify-center text-xs text-secondary-400 font-bold">
        Memuat Peta Navigasi...
      </div>
    ),
  }
);
import { PageTransition, FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/db';
import { toast } from 'sonner';

const LOCATION_TYPES = [
  { value: 'Rumah', label: 'Rumah', icon: '🏠' },
  { value: 'Kantor', label: 'Kantor', icon: '🏢' },
  { value: 'Sekolah', label: 'Sekolah', icon: '🏫' },
  { value: 'Rumah Sakit', label: 'Rumah Sakit', icon: '🏥' },
  { value: 'Apotek', label: 'Apotek', icon: '💊' },
  { value: 'Masjid', label: 'Masjid', icon: '🕌' },
  { value: 'Gereja', label: 'Gereja', icon: '⛪' },
  { value: 'Toko', label: 'Toko', icon: '🏪' },
  { value: 'Minimarket', label: 'Minimarket', icon: '🛒' },
  { value: 'Mall', label: 'Mall', icon: '🏬' },
  { value: 'Restoran', label: 'Restoran', icon: '🍽' },
  { value: 'Cafe', label: 'Cafe', icon: '☕' },
  { value: 'Bank', label: 'Bank', icon: '🏦' },
  { value: 'Hotel', label: 'Hotel', icon: '🏨' },
  { value: 'Pabrik', label: 'Pabrik', icon: '🏭' },
  { value: 'Gudang', label: 'Gudang', icon: '📦' },
  { value: 'Terminal', label: 'Terminal', icon: '🚏' },
  { value: 'Stasiun', label: 'Stasiun', icon: '🚉' },
  { value: 'Bandara', label: 'Bandara', icon: '🛫' },
  { value: 'Lainnya', label: 'Lainnya', icon: '📍' },
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ShoppingBag,
  UtensilsCrossed,
  Pill,
  FileText,
  Package,
  MoreHorizontal,
  Bike,
  Car,
  Truck,
};

const PAYMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Banknote,
  QrCode,
  Building2,
};

  

const DEFAULT_PICKUP_ADDRESS = 'Desa/Kel. Kalirejo, Kec. Kalirejo, Kab. Lampung Tengah, Prov. Lampung';
const DEFAULT_PICKUP_COORDS: LatLng = { lat: -5.2760, lng: 104.9825 };
const DEFAULT_PICKUP_DETAILS: DetailedAddress = {
  displayName: 'Desa/Kel. Kalirejo, Kec. Kalirejo, Kab. Lampung Tengah, Prov. Lampung',
  formattedAddress: 'Desa/Kel. Kalirejo, Kec. Kalirejo, Kab. Lampung Tengah, Prov. Lampung',
  village: 'Kalirejo',
  subdistrict: 'Kalirejo',
  county: 'Lampung Tengah',
  state: 'Lampung',
};

export function OrderForm() {
  const { user } = useAuth();

  // 1. Basic Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');
  
  const [pickupAddress, setPickupAddress] = useState(DEFAULT_PICKUP_ADDRESS);
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(DEFAULT_PICKUP_COORDS);

  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<LatLng | null>(null);

  const [category, setCategory] = useState<OrderCategory | ''>('ride'); // Default Ojek
  const [description, setDescription] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 2. Logistics & Price Additions
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    { id: '1', name: '', quantity: 1, estimatedPrice: 0, notes: '' }
  ]);
  const [weightRange, setWeightRange] = useState<string>('0-2'); // logistics weight or Ojek weight
  const [waitingMinutes, setWaitingMinutes] = useState<number>(0);
  const [hasRain, setHasRain] = useState<boolean>(false);
  const [hasHoliday, setHasHoliday] = useState<boolean>(false);
  const [hasPeakHour, setHasPeakHour] = useState<boolean>(false);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [routeOption, setRouteOption] = useState<'fastest' | 'shortest' | 'motorcycle'>('fastest');

  // Ojek specifics
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [ojekHelmet, setOjekHelmet] = useState<'need' | 'own'>('need');
  const [ojekRoundTrip, setOjekRoundTrip] = useState<boolean>(false);

  // Layout & Navigation State
  const [isMobile, setIsMobile] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active marker type for map clicks
  const [activeMarkerType, setActiveMarkerType] = useState<'pickup' | 'destination'>('pickup');

  // Location geofencing & detailed states
  const [pickupDetails, setPickupDetails] = useState<DetailedAddress | null>(DEFAULT_PICKUP_DETAILS);
  const [destinationDetails, setDestinationDetails] = useState<DetailedAddress | null>(null);
  const [pickupLocationType, setPickupLocationType] = useState<string>('Rumah');
  const [pickupLandmark, setPickupLandmark] = useState<string>('');
  const [pickupPhotoUrl, setPickupPhotoUrl] = useState<string | null>(null);
  const [isUploadingPickupPhoto, setIsUploadingPickupPhoto] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [isLocatingDestination, setIsLocatingDestination] = useState(false);
  const [destinationAccuracy, setDestinationAccuracy] = useState<number | null>(null);
  const [gmapsLinkInput, setGmapsLinkInput] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  // Auto-detect Peak Hour (17.00 - 19.00)
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 17 && hours <= 19) {
      setHasPeakHour(true);
    }
  }, []);

  // Detect responsive screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSheetExpanded(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Price Calculation Hook
  const { pricing, isCalculating, calculate, routeCoordinates } = usePriceCalculation();

  const isPickupOutside = pickupCoords ? !isWithinLampung(pickupCoords.lat, pickupCoords.lng) : false;
  const isDestOutside = destinationCoords ? !isWithinLampung(destinationCoords.lat, destinationCoords.lng) : false;
  const isOutsideLampung = isPickupOutside || isDestOutside;

  // Shopping Calculations
  const validShoppingItems = shoppingItems.filter(item => item.name.trim() !== '');
  const totalItemPrice = validShoppingItems.reduce(
    (sum, item) => sum + (item.estimatedPrice * item.quantity),
    0
  );
  const totalItemCount = validShoppingItems.reduce((sum, item) => sum + item.quantity, 0);

  // Recalculate price dynamically when inputs alter
  useEffect(() => {
    if (pickupCoords && destinationCoords && !isOutsideLampung) {
      calculate(pickupCoords, destinationCoords, totalItemPrice, {
        category: category || undefined,
        weightRange,
        itemCount: totalItemCount,
        hasRain,
        waitingMinutes,
        hasHoliday,
        hasPeakHour,
        hasInsurance,
        promoCode: appliedPromo || undefined,
        isRoundTrip: category === 'ride' ? ojekRoundTrip : false,
      });
    }
  }, [
    pickupCoords,
    destinationCoords,
    totalItemPrice,
    category,
    weightRange,
    totalItemCount,
    hasRain,
    waitingMinutes,
    isOutsideLampung,
    hasHoliday,
    hasPeakHour,
    hasInsurance,
    appliedPromo,
    ojekRoundTrip,
    calculate
  ]);

  // Manual Edit handler for Detail Wilayah fields with auto relocation & search
  const handleUpdateDetailField = useCallback(
    (type: 'pickup' | 'destination', field: keyof DetailedAddress, value: string) => {
      const isPickup = type === 'pickup';
      const currentDetails = isPickup ? pickupDetails : destinationDetails;

      const updatedDetails: DetailedAddress = {
        displayName: currentDetails?.displayName || '',
        formattedAddress: '',
        name: currentDetails?.name,
        road: currentDetails?.road,
        village: currentDetails?.village || '',
        subdistrict: currentDetails?.subdistrict || '',
        county: currentDetails?.county || 'Lampung Tengah',
        state: currentDetails?.state || 'Lampung',
        [field]: value,
      };

      const newFormattedAddress = formatDetailedAddress(updatedDetails);
      updatedDetails.formattedAddress = newFormattedAddress;
      updatedDetails.displayName = newFormattedAddress;

      if (isPickup) {
        setPickupDetails(updatedDetails);
        setPickupAddress(newFormattedAddress);
      } else {
        setDestinationDetails(updatedDetails);
        setDestinationAddress(newFormattedAddress);
      }

      // Auto-search & relocate map pin to the updated typed address
      geocodeAddressText(
        newFormattedAddress,
        updatedDetails.village,
        updatedDetails.subdistrict,
        updatedDetails.county
      ).then((coords) => {
        if (coords) {
          if (isPickup) {
            setPickupCoords(coords);
            toast.success(`📍 Pin jemput disesuaikan ke ${updatedDetails.village || updatedDetails.subdistrict}`);
          } else {
            setDestinationCoords(coords);
            toast.success(`📍 Pin tujuan disesuaikan ke ${updatedDetails.village || updatedDetails.subdistrict}`);
          }
        }
      });
    },
    [pickupDetails, destinationDetails]
  );

  // Auto-geocode pickupAddress text when coords is null or text changes
  useEffect(() => {
    if (!pickupAddress.trim()) return;
    if (pickupAddress === DEFAULT_PICKUP_ADDRESS) {
      setPickupCoords(DEFAULT_PICKUP_COORDS);
      return;
    }
    const timer = setTimeout(async () => {
      const coords = await geocodeAddressText(
        pickupAddress,
        pickupDetails?.village,
        pickupDetails?.subdistrict,
        pickupDetails?.county
      );
      if (coords) {
        setPickupCoords((prev) => {
          if (!prev || Math.abs(prev.lat - coords.lat) > 0.005 || Math.abs(prev.lng - coords.lng) > 0.005) {
            return coords;
          }
          return prev;
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pickupAddress, pickupDetails]);

  // Auto-geocode destinationAddress text when coords is null or text changes
  useEffect(() => {
    if (!destinationAddress.trim()) return;
    const timer = setTimeout(async () => {
      const coords = await geocodeAddressText(
        destinationAddress,
        destinationDetails?.village,
        destinationDetails?.subdistrict,
        destinationDetails?.county
      );
      if (coords) {
        setDestinationCoords((prev) => {
          if (!prev || Math.abs(prev.lat - coords.lat) > 0.005 || Math.abs(prev.lng - coords.lng) > 0.005) {
            return coords;
          }
          return prev;
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destinationAddress, destinationDetails]);

  const renderDetailedAddress = (details: DetailedAddress | null, labelTag: string = 'Lokasi', type?: 'pickup' | 'destination') => {
    const village = details?.village || '';
    const inferred = inferKecamatan(village);
    const subdistrict = details?.subdistrict || inferred?.subdistrict || '';
    const county = details?.county || inferred?.county || 'Lampung Tengah';
    const state = details?.state || 'Lampung';

    const isEditable = Boolean(type);

    return (
      <div className="mt-2.5 p-3.5 bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-200/90 rounded-2xl text-xs space-y-2.5 shadow-soft-xs text-left">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 font-bold text-[10px] text-amber-900 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">📍</span>
            <span>Detail Wilayah ({labelTag})</span>
          </span>
          <span className="text-emerald-700 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-emerald-200 shadow-soft-xs">
            {isEditable ? '✏️ Bisa Diisi / Diedit Manual' : '✓ Terverifikasi'}
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Desa / Kelurahan */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-secondary-600 uppercase tracking-wider flex items-center gap-1">
              <span>🏡</span>
              <span>Desa / Kelurahan</span>
            </label>
            {isEditable && type ? (
              <input
                type="text"
                value={village}
                onChange={(e) => handleUpdateDetailField(type, 'village', e.target.value)}
                placeholder="cth: Sri Basuki / Kalirejo"
                className="w-full bg-white font-bold text-secondary-900 px-2.5 py-1.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs shadow-soft-xs"
              />
            ) : (
              <div className="bg-white/90 font-bold text-secondary-900 px-2.5 py-1.5 rounded-xl border border-amber-150">
                {village || '-'}
              </div>
            )}
          </div>

          {/* Kecamatan */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <span>🏘️</span>
              <span>Kecamatan</span>
            </label>
            {isEditable && type ? (
              <>
                <input
                  type="text"
                  list={`kec-list-${type}`}
                  value={subdistrict}
                  onChange={(e) => handleUpdateDetailField(type, 'subdistrict', e.target.value)}
                  placeholder="cth: Kalirejo"
                  className="w-full bg-white font-extrabold text-amber-950 px-2.5 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs shadow-soft-xs"
                />
                <datalist id={`kec-list-${type}`}>
                  {KECAMATAN_OPTIONS.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </>
            ) : (
              <div className="bg-white/90 font-extrabold text-amber-950 px-2.5 py-1.5 rounded-xl border border-amber-150">
                {subdistrict || 'Kalirejo'}
              </div>
            )}
          </div>

          {/* Kabupaten / Kota */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-secondary-600 uppercase tracking-wider flex items-center gap-1">
              <span>🏙️</span>
              <span>Kabupaten / Kota</span>
            </label>
            {isEditable && type ? (
              <input
                type="text"
                value={county}
                onChange={(e) => handleUpdateDetailField(type, 'county', e.target.value)}
                placeholder="cth: Lampung Tengah"
                className="w-full bg-white font-semibold text-secondary-800 px-2.5 py-1.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs shadow-soft-xs"
              />
            ) : (
              <div className="bg-white/90 font-semibold text-secondary-800 px-2.5 py-1.5 rounded-xl border border-amber-150">
                {county}
              </div>
            )}
          </div>

          {/* Provinsi */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-secondary-600 uppercase tracking-wider flex items-center gap-1">
              <span>🗺️</span>
              <span>Provinsi</span>
            </label>
            {isEditable && type ? (
              <input
                type="text"
                value={state}
                onChange={(e) => handleUpdateDetailField(type, 'state', e.target.value)}
                placeholder="cth: Lampung"
                className="w-full bg-white font-semibold text-secondary-800 px-2.5 py-1.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs shadow-soft-xs"
              />
            ) : (
              <div className="bg-white/90 font-semibold text-secondary-800 px-2.5 py-1.5 rounded-xl border border-amber-150">
                {state}
              </div>
            )}
          </div>
        </div>

        {isEditable && (
          <p className="text-[9px] text-amber-800/80 italic font-medium pt-0.5">
            💡 Kamu bisa mengubah Desa atau Kecamatan di atas secara manual. Alamat & lokasi peta akan otomatis menyesuaikan data yang kamu isi.
          </p>
        )}
      </div>
    );
  };

  // Geocoding Coordinates handlers
  const handlePickupCoordsChange = async (coords: LatLng) => {
    setPickupCoords(coords);
    setIsReverseGeocoding(true);
    try {
      const data = await reverseGeocodeWithCache(coords.lat, coords.lng);
      const details = parseNominatimAddress(data, coords);
      const addressText = details.formattedAddress || formatDetailedAddress(details) || 'Lokasi Peta Pilihan';
      setPickupDetails(details);
      setPickupAddress(addressText);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.pickupAddress;
        return copy;
      });
      toast.success('Lokasi jemput diperbarui dari pin peta');
    } catch (err) {
      console.error(err);
      const details = parseNominatimAddress(null, coords);
      const fallbackAddress = details.formattedAddress || 'Lokasi Peta Pilihan';
      setPickupAddress(fallbackAddress);
      toast.success('Lokasi jemput disesuaikan dengan koordinat peta');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleDestinationCoordsChange = async (coords: LatLng) => {
    setDestinationCoords(coords);
    setIsReverseGeocoding(true);
    try {
      const data = await reverseGeocodeWithCache(coords.lat, coords.lng);
      const details = parseNominatimAddress(data, coords);
      const addressText = details.formattedAddress || formatDetailedAddress(details) || 'Lokasi Peta Pilihan';
      setDestinationDetails(details);
      setDestinationAddress(addressText);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.destinationAddress;
        return copy;
      });
      toast.success('Lokasi tujuan diperbarui dari pin peta');
    } catch (err) {
      console.error(err);
      const details = parseNominatimAddress(null, coords);
      const fallbackAddress = details.formattedAddress || 'Lokasi Peta Pilihan';
      setDestinationAddress(fallbackAddress);
      toast.success('Lokasi tujuan disesuaikan dengan koordinat peta');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Get User Current Location
  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung layanan lokasi GPS.');
      return;
    }
    setIsLocating(true);
    toast.info('Mencari koordinat GPS Anda...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPickupCoords(coords);
        try {
          const data = await reverseGeocodeWithCache(coords.lat, coords.lng);
          if (data) {
            const details = parseNominatimAddress(data, coords);
            setPickupDetails(details);
            setPickupAddress(details.formattedAddress || details.displayName);
            toast.success('Lokasi jemput berhasil disesuaikan dengan GPS!');
          }
        } catch (err) {
          console.error(err);
          setPickupAddress(`Lokasi GPS (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error('Izin lokasi ditolak atau sinyal GPS lemah.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Photo uploads
  const handleLocationPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPickupPhoto(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPickupPhotoUrl(ev.target?.result as string);
      setIsUploadingPickupPhoto(false);
      toast.success('Foto lokasi terunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Get User Current Real-Time Location for Destination via Google Maps GPS
  const handleGetDestinationLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung layanan lokasi GPS.');
      return;
    }
    setIsLocatingDestination(true);
    toast.info('🎯 Mendeteksi lokasi real-time Anda via Google Maps GPS (Akurasi ~5m)...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : 5;

        setDestinationCoords(coords);
        setDestinationAccuracy(accuracy);

        try {
          const data = await reverseGeocodeWithCache(coords.lat, coords.lng);
          if (data) {
            const details = parseNominatimAddress(data, coords);
            setDestinationDetails(details);
            setDestinationAddress(details.formattedAddress || details.displayName);
            toast.success(`📍 Lokasi tujuan terdeteksi (Akurasi ±${accuracy}m)! Ongkos kirim langsung kalkulasi.`);
          } else {
            setDestinationAddress(`Lokasi GPS Real-time (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
            toast.success(`📍 Koordinat lokasi tujuan disesuaikan (±${accuracy}m)!`);
          }
        } catch (err) {
          console.error(err);
          setDestinationAddress(`Lokasi GPS Real-time (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
          toast.success(`📍 Koordinat lokasi tujuan disesuaikan dengan GPS!`);
        } finally {
          setIsLocatingDestination(false);
        }
      },
      (error) => {
        console.error('GPS Destination error:', error);
        toast.error('Izin lokasi ditolak atau sinyal GPS lemah. Membuka Google Maps...');
        setIsLocatingDestination(false);
        window.open('https://www.google.com/maps', '_blank');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleParseGmapsInput = (inputVal: string) => {
    setGmapsLinkInput(inputVal);
    if (!inputVal.trim()) return;
    const coords = parseGoogleMapsCoordinates(inputVal);
    if (coords) {
      handleDestinationCoordsChange(coords);
      toast.success('📍 Koordinat Google Maps berhasil diekstrak & disesuaikan!');
    }
  };

  const handleResetLocations = () => {
    setPickupAddress(DEFAULT_PICKUP_ADDRESS);
    setPickupCoords(DEFAULT_PICKUP_COORDS);
    setPickupDetails(DEFAULT_PICKUP_DETAILS);
    setDestinationAddress('');
    setDestinationCoords(null);
    setDestinationDetails(null);
    setDestinationAccuracy(null);
    setGmapsLinkInput('');
    setErrors({});
    toast.info('Lokasi jemput dikembalikan ke Kalirejo & lokasi tujuan direset');
  };

  // Shopping List item controls
  const addShoppingItem = () => {
    setShoppingItems([...shoppingItems, { id: Date.now().toString(), name: '', quantity: 1, estimatedPrice: 0 }]);
  };

  const removeShoppingItem = (id: string) => {
    if (shoppingItems.length > 1) {
      setShoppingItems(shoppingItems.filter(item => item.id !== id));
    }
  };

  const updateShoppingItem = (id: string, field: keyof ShoppingItem, value: any) => {
    setShoppingItems(
      shoppingItems.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Apply code promo action
  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setAppliedPromo('');
      toast.info('Kode promo dikosongkan.');
      return;
    }

    if (['JSSPERDANA', 'DISKON30', 'DISKON50'].includes(code)) {
      setAppliedPromo(code);
      toast.success(`Kode promo "${code}" berhasil diterapkan!`);
    } else {
      toast.error('Kode promo tidak valid atau sudah kedaluwarsa.');
    }
  };

  // Form inputs validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = 'Nama lengkap wajib diisi';
    if (!whatsappNumber.trim()) newErrors.whatsappNumber = 'Nomor WhatsApp wajib diisi';
    else if (!/^(\+?62|0)8\d{8,11}$/.test(whatsappNumber.replace(/\s/g, '')))
      newErrors.whatsappNumber = 'Format nomor HP tidak valid';

    if (!pickupAddress.trim()) newErrors.pickupAddress = 'Alamat jemput wajib diisi';
    if (!destinationAddress.trim()) newErrors.destinationAddress = 'Alamat tujuan wajib diisi';
    if (!category) newErrors.category = 'Pilih kategori pesanan';

    if (isOutsideLampung) {
      newErrors.geofence = 'Layanan JSS saat ini hanya beroperasi di Provinsi Lampung.';
    }

    if (category === 'ride') {
      // Ojek validations
    } else if (['shopping', 'food', 'medicine'].includes(category)) {
      if (validShoppingItems.length === 0) {
        newErrors.shoppingItems = 'Harap isi minimal 1 barang belanjaan';
      }
    } else {
      if (!description.trim()) newErrors.description = 'Deskripsi barang/kegiatan wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Booking submit WhatsApp dispatch
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    // Build description
    let finalDescription = description;
    if (category === 'ride') {
      finalDescription = `🛵 OJEK (ANTAR ORANG)\nPenumpang: ${passengerCount} Orang\nBerat Penumpang: ${weightRange === '<80' ? '<80 kg' : weightRange === '80-120' ? '80-120 kg' : '120 kg+'}\nHelm: ${ojekHelmet === 'need' ? 'Butuh Helm' : 'Bawa Helm Sendiri'}\nPulang Pergi: ${ojekRoundTrip ? 'Ya (Pulang Pergi)' : 'Tidak'}`;
    } else if (['shopping', 'food', 'medicine'].includes(category)) {
      finalDescription = 'Daftar Belanjaan:\n' + validShoppingItems
        .map((item, idx) => `${idx + 1}. ${item.name} (${item.quantity}x) Catatan: ${item.notes || '-'}`)
        .join('\n');
    }

    let createdOrder;
    try {
      const notesToUse = category === 'ride' ? deliveryNotes : deliveryNotes;
      const finalDeliveryNotes = `${notesToUse || ''}\n\n[Rincian Tambahan]\nJenis Lokasi: ${pickupLocationType}\nPatokan: ${pickupLandmark || '-'}\nHelm: ${ojekHelmet === 'need' ? 'Butuh' : 'Bawa Sendiri'}\nRoundTrip: ${ojekRoundTrip ? 'Ya' : 'Tidak'}`;

      createdOrder = await dbService.createOrder(
        {
          customerName,
          whatsappNumber,
          pickupAddress,
          pickupCoordinates: pickupCoords || undefined,
          destinationAddress,
          destinationCoordinates: destinationCoords || undefined,
          category: category as any,
          description: finalDescription,
          photoUrl: photoPreview || undefined,
          estimatedItemPrice: category === 'ride' ? 0 : totalItemPrice,
          deliveryNotes: finalDeliveryNotes,
          paymentMethod,
        },
        {
          distance: pricing?.distance || 0,
          duration: pricing?.duration || 0,
          totalDeliveryFee: pricing?.totalDeliveryFee || 0,
          grandTotal: pricing?.grandTotal || 0,
        },
        user?.id
      );
      if (createdOrder) {
        setCreatedOrderNumber(createdOrder.orderNumber);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan pemesanan ke database');
      setIsSubmitting(false);
      return;
    }

    // Build Whatsapp message
    const distText = pricing ? formatDistance(pricing.distance) : 'Belum dihitung';
    const durationText = pricing ? formatDuration(pricing.duration) : 'Belum dihitung';
    const driverPickupEta = Math.round(5 + (pricing?.distance || 1000) / 1500); // Simulated driver arrival ETA based on pickup coords
    const routeOptionLabel = routeOption === 'fastest' ? 'Rute Tercepat' : routeOption === 'shortest' ? 'Rute Terpendek' : 'Rute Motor';
    const categoryLabel = ORDER_CATEGORIES.find(c => c.id === category)?.label || category;
    const paymentMethodLabel = PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label || paymentMethod;

    let additionalText = '';
    if (category === 'ride') {
      additionalText = `  - Jumlah Penumpang: ${passengerCount} Orang
  - Helm: ${ojekHelmet === 'need' ? 'Butuh Helm Admin' : 'Bawa Helm Sendiri'}
  - Pulang Pergi: ${ojekRoundTrip ? 'Ya (+Biaya Tambahan)' : 'Tidak'}`;
    } else {
      additionalText = `  - Estimasi Berat Barang: ${weightRange} kg
  - Jumlah Jenis Barang: ${totalItemCount} pcs`;
    }

    const itemizedFees = pricing ? `
  - Biaya Dasar (Base): ${formatCurrency(pricing.baseFee)}
  - Biaya Jarak Tempuh: ${formatCurrency(pricing.distanceFee)}
  ${pricing.serviceFee && pricing.serviceFee > 0 ? `  - Biaya Layanan Sistem: ${formatCurrency(pricing.serviceFee)}\n` : ''}  - Asuransi Layanan: ${formatCurrency(pricing.insuranceFee || 0)}
  ${pricing.isRoundTrip && pricing.roundTripFee && pricing.roundTripFee > 0 ? `  - Layanan Pulang Pergi (PP 2x Tarif): +${formatCurrency(pricing.roundTripFee)}\n` : ''}${pricing.waitingFee > 0 ? `  - Biaya Tunggu: ${formatCurrency(pricing.waitingFee)}\n` : ''}${pricing.rainFee > 0 ? `  - Surcharge Hujan: ${formatCurrency(pricing.rainFee)}\n` : ''}${pricing.holidayFee && pricing.holidayFee > 0 ? `  - Surcharge Hari Libur: ${formatCurrency(pricing.holidayFee)}\n` : ''}${pricing.peakHourFee && pricing.peakHourFee > 0 ? `  - Surcharge Jam Sibuk: ${formatCurrency(pricing.peakHourFee)}\n` : ''}${pricing.weightFee > 0 ? `  - Surcharge Berat Paket: ${formatCurrency(pricing.weightFee)}\n` : ''}${['shopping', 'food', 'medicine'].includes(category) ? `  - Biaya Jasa Titip Belanja: GRATIS 🎉\n` : pricing.shoppingFee > 0 ? `  - Biaya Jasa Titip Belanja: ${formatCurrency(pricing.shoppingFee)}\n` : ''}${pricing.promoDiscount && pricing.promoDiscount > 0 ? `  - Diskon Promo (${appliedPromo}): -${formatCurrency(pricing.promoDiscount)}\n` : ''}` : '';

    const osmLink = pickupCoords && destinationCoords 
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pickupCoords.lat}%2C${pickupCoords.lng}%3B${destinationCoords.lat}%2C${destinationCoords.lng}`
      : '';

    const rawMessage = `*JASA SURUH KALIREJO (JSS)*
=========================
*Rincian Booking Baru (${createdOrder?.orderNumber || 'JSS-NEW'})*

👤 *Pelanggan:* ${customerName}
📞 *No. WhatsApp:* ${whatsappNumber}
🛵 *Layanan:* ${categoryLabel}

📍 *Titik Jemput (${pickupLocationType}):*
${pickupAddress}
${pickupLandmark ? `_Patokan: ${pickupLandmark}_` : ''}

🏁 *Titik Tujuan:*
${destinationAddress}

⚙️ *Detail Perjalanan:*
🚗 Jarak Rute: ${distText}
⏱️ Waktu Tempuh: ${durationText}
⏱️ ETA Driver Jemput: ~${driverPickupEta} menit
🛵 Profil Rute: ${routeOptionLabel}

➕ *Detail Tambahan:*
${additionalText}

💳 *Rincian Tarif:*${itemizedFees}-------------------------
💰 *GRAND TOTAL:* ${pricing ? formatCurrency(pricing.grandTotal) : 'Belum dihitung'}
💵 *Metode Pembayaran:* ${paymentMethodLabel}

🗺️ *Tautan Peta Rute:*
${osmLink}`;

    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrlString = `https://wa.me/${BRAND.phone}?text=${encodedMessage}`;

    setWhatsappUrl(whatsappUrlString);
    setIsSubmitted(true);
    setIsSubmitting(false);

    // Open WhatsApp after small timeout
    setTimeout(() => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobileDevice) {
        window.location.href = whatsappUrlString;
      } else {
        window.open(whatsappUrlString, '_blank');
      }
    }, 1000);
  };

  const handleDownloadReceipt = async () => {
    if (!pricing) return;
    setIsDownloadingReceipt(true);

    try {
      let targetElement = document.getElementById('jss-confirm-modal-card');
      let openedModalByUs = false;

      if (!targetElement) {
        setShowConfirmModal(true);
        openedModalByUs = true;
        await new Promise((res) => setTimeout(res, 400));
        targetElement = document.getElementById('jss-confirm-modal-card');
      }

      if (!targetElement) {
        toast.error('Tampilan konfirmasi pesanan tidak ditemukan.');
        setIsDownloadingReceipt(false);
        return;
      }

      const html2canvasModule = (await import('html2canvas')).default;

      const canvas = await html2canvasModule(targetElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const card = clonedDoc.getElementById('jss-confirm-modal-card');
          if (card) {
            card.style.maxHeight = 'none';
            card.style.height = 'auto';
            card.style.overflow = 'visible';
            card.style.borderRadius = '20px';
            card.style.boxShadow = 'none';
            card.style.position = 'relative';

            // Find all scrollable parent & child containers and remove scroll restrictions
            const divs = card.querySelectorAll('div');
            divs.forEach((el) => {
              if (el.classList.contains('overflow-y-auto') || el.style.overflowY === 'auto' || el.style.maxHeight) {
                el.style.maxHeight = 'none';
                el.style.height = 'auto';
                el.style.overflow = 'visible';
                el.style.paddingBottom = '20px';
                el.classList.remove('overflow-y-auto');
              }
            });

            // Hide close button (✕)
            const buttons = card.querySelectorAll('button');
            buttons.forEach((btn) => {
              if (btn.innerText.includes('✕')) {
                btn.style.display = 'none';
              }
            });

            // Replace action buttons footer with branded receipt footer
            const actionDiv = card.querySelector('.bg-secondary-50.border-t') as HTMLElement;
            if (actionDiv) {
              actionDiv.className = 'p-4 bg-secondary-900 text-center text-white border-t border-secondary-800';
              actionDiv.innerHTML = `
                <div style="font-size: 12px; font-weight: 800; color: #FACC15; letter-spacing: 0.5px; margin-bottom: 3px;">JSS (JASA SURUH KALIREJO)</div>
                <div style="font-size: 10px; color: #94A3B8;">Struk Resmi Konfirmasi Pemesanan • WA Admin: ${BRAND.phone} • https://web-jssv2.vercel.app</div>
              `;
            }
          }
        }
      });

      const orderCode = createdOrderNumber || `JSS-${Math.floor(100000 + Math.random() * 900000)}`;
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Struk_Konfirmasi_JSS_${orderCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Struk konfirmasi pesanan berhasil di-download! 📥');
    } catch (err) {
      console.error('Error html2canvas:', err);
      toast.error('Gagal mengunduh struk pesanan.');
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Harap lengkapi seluruh kolom yang WAJIB diisi (* WAJIB)');
      const formElement = document.getElementById('order-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    setShowConfirmModal(true);
  };

  const isRideFormValid = 
    customerName.trim() !== '' &&
    whatsappNumber.trim() !== '' &&
    pickupCoords !== null &&
    pickupAddress.trim() !== '' &&
    destinationCoords !== null &&
    destinationAddress.trim() !== '';

  const isSubmitDisabled = !!(category === 'ride'
    ? !isRideFormValid || isCalculating || isOutsideLampung
    : isCalculating || isOutsideLampung || !pickupCoords || !destinationCoords || !category);

  // Success dispatch layout
  if (isSubmitted) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-card p-8 border border-secondary-100 shadow-soft-xl"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-extrabold text-secondary-900 mb-2 font-outfit">Pemesanan Terkirim! 🚀</h2>
          <p className="text-xs text-secondary-500 mb-6 leading-relaxed">
            Pesanan Anda (No: <strong className="text-secondary-900">{createdOrderNumber}</strong>) sedang dialihkan ke WhatsApp untuk alokasi driver logistik terdekat.
          </p>
          <div className="space-y-2">
            <a
              href={whatsappUrl || `https://wa.me/${BRAND.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              <MessageCircle className="w-5 h-5" />
              Kirim Manual ke WhatsApp
            </a>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full text-xs font-bold text-secondary-500 hover:text-secondary-800 py-2.5 transition-colors"
            >
              Pesan Layanan Lain
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Weather dynamic calculations
  const localWeatherText = hasRain 
    ? '⛈️ Badai Hujan (Waspada jalan licin & tarif cuaca buruk)' 
    : '⛅ Cerah Berawan (Kondisi lalu lintas terpantau lancar)';

  const weatherAlertVisible = hasRain;

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] pt-16 bg-background">
        
        {/* LEFT PANEL: Booking Controls & Inputs */}
        <div className={cn(
          "w-full lg:w-[480px] lg:flex-shrink-0 bg-white border-r border-secondary-150 flex flex-col z-10 shadow-soft-lg transition-all",
          isMobile ? "relative overflow-y-auto" : "h-[calc(100vh-80px)] overflow-y-auto"
        )}>
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Header info */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary-700 text-[10px] font-extrabold uppercase rounded-full mb-3 tracking-wider">
                <Truck className="w-3.5 h-3.5" /> Platform Premium JSS
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-900 tracking-tight font-outfit">
                Pesan <span className="gradient-text font-black">Layanan JSS</span>
              </h1>
              <p className="text-xs text-secondary-400 mt-1">
                Layanan antar-jemput dan logistik kurir terpercaya Provinsi Lampung.
              </p>
            </div>

            {/* Weather status notification */}
            <div className={cn(
              "p-3.5 rounded-2xl border text-xs space-y-1 transition-all flex items-start gap-3 shadow-sm",
              hasRain 
                ? "bg-blue-50/50 border-blue-200 text-blue-900 animate-pulse" 
                : "bg-amber-50/20 border-amber-200/50 text-secondary-800"
            )}>
              <CloudRain className={cn("w-5 h-5 mt-0.5", hasRain ? "text-blue-500 animate-bounce" : "text-amber-500")} />
              <div>
                <p className="font-extrabold tracking-tight font-outfit">Kondisi Cuaca Kalirejo</p>
                <p className="text-[11px] text-secondary-500 leading-relaxed mt-0.5">{localWeatherText}</p>
                {weatherAlertVisible && (
                  <div className="mt-1.5 p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-700 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    Warning: Tambahan Surcharge Hujan Aktif (+Rp3.000)
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form id="order-form-container" onSubmit={handleOpenConfirm} className="space-y-5">
              
              {/* Top Help Guide Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-xs leading-relaxed text-amber-950 shadow-sm">
                <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-xs font-outfit">📌 Petunjuk Pengisian Form:</p>
                  <p className="text-[11px] text-secondary-700">
                    Kolom bertanda <span className="text-red-600 font-extrabold px-1.5 py-0.5 bg-red-100/90 rounded border border-red-200 text-[10px]">* WAJIB</span> harus diisi. Kolom bertanda <span className="text-secondary-600 font-semibold px-1.5 py-0.5 bg-secondary-150 rounded border border-secondary-250 text-[10px]">(OPSIONAL)</span> boleh dikosongkan jika tidak ada catatan.
                  </p>
                </div>
              </div>

              {/* Profile/Customer name */}
              <div className="space-y-4 bg-secondary-50/40 p-4 border border-secondary-100 rounded-2xl">
                <h3 className="text-sm font-bold text-secondary-900 flex items-center justify-between font-outfit">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Pemesanan Akun
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                    Data Pelanggan
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Nama Lengkap</span>
                      <span className="text-red-500 font-extrabold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 tracking-wider">* WAJIB</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.customerName) {
                          setErrors(prev => { const copy = { ...prev }; delete copy.customerName; return copy; });
                        }
                      }}
                      placeholder="Contoh: Budi Santoso"
                      className={cn(
                        "input-premium py-2.5 text-xs rounded-xl transition-all",
                        errors.customerName ? "bg-red-50/50 border-red-500 focus:ring-red-200" : customerName ? "bg-emerald-50/30 border-emerald-300" : "bg-white border-secondary-200"
                      )}
                    />
                    {errors.customerName ? (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold flex items-center gap-1">⚠️ {errors.customerName}</p>
                    ) : (
                      <p className="text-[9.5px] text-secondary-400 mt-1">Nama pemesan atau panggilan untuk konfirmasi</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>No. WhatsApp</span>
                      <span className="text-red-500 font-extrabold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 tracking-wider">* WAJIB</span>
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => {
                        setWhatsappNumber(e.target.value);
                        if (errors.whatsappNumber) {
                          setErrors(prev => { const copy = { ...prev }; delete copy.whatsappNumber; return copy; });
                        }
                      }}
                      placeholder="08xxxxxxxxxx"
                      className={cn(
                        "input-premium py-2.5 text-xs rounded-xl transition-all",
                        errors.whatsappNumber ? "bg-red-50/50 border-red-500 focus:ring-red-200" : whatsappNumber ? "bg-emerald-50/30 border-emerald-300" : "bg-white border-secondary-200"
                      )}
                    />
                    {errors.whatsappNumber ? (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold flex items-center gap-1">⚠️ {errors.whatsappNumber}</p>
                    ) : (
                      <p className="text-[9.5px] text-secondary-400 mt-1">10-14 digit nomor aktif untuk konfirmasi kurir</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rute / Addresses */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-secondary-900 flex items-center gap-2 font-outfit">
                    <MapPin className="w-4 h-4 text-primary" />
                    Rute Perjalanan
                  </h3>
                  {(pickupCoords || destinationCoords) && (
                    <button
                      type="button"
                      onClick={handleResetLocations}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Reset Rute
                    </button>
                  )}
                </div>

                <div className="space-y-3.5">
                  <AddressAutocomplete
                    label="Lokasi Jemput *"
                    placeholder="Masukkan alamat jemput..."
                    value={pickupAddress}
                    onChange={(address, coords, details) => {
                      setPickupAddress(address);
                      setPickupCoords(coords);
                      if (details) setPickupDetails(parseNominatimAddress(details));
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.pickupAddress;
                        return copy;
                      });
                    }}
                    error={errors.pickupAddress || (isPickupOutside ? 'Titik jemput di luar Lampung!' : undefined)}
                    icon={<MapPin className="w-4.5 h-4.5 text-emerald-500" />}
                    showGpsButton={true}
                    onGpsClick={handleGetLocation}
                    gpsLoading={isLocating}
                    onFocus={() => setActiveMarkerType('pickup')}
                  />
                  {renderDetailedAddress(pickupDetails, 'Jemput', 'pickup')}

                  {pickupCoords && (
                    <div className="bg-secondary-50/30 p-3 border border-secondary-100 rounded-2xl space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-extrabold text-secondary-600 uppercase tracking-wider flex items-center justify-between">
                            <span>Jenis Lokasi</span>
                            <span className="text-secondary-400 font-semibold text-[8px]">(OPSIONAL)</span>
                          </label>
                          <select
                            value={pickupLocationType}
                            onChange={(e) => setPickupLocationType(e.target.value)}
                            className="input-premium py-1 px-2 text-[11px] rounded-lg bg-white border border-secondary-200 mt-1"
                          >
                            {LOCATION_TYPES.map(loc => (
                              <option key={loc.value} value={loc.value}>{loc.icon} {loc.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-extrabold text-secondary-600 uppercase tracking-wider flex items-center justify-between">
                            <span>Foto Tempat</span>
                            <span className="text-secondary-400 font-semibold text-[8px]">(OPSIONAL)</span>
                          </label>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <label className="cursor-pointer bg-white hover:bg-secondary-50 border border-secondary-200 rounded-lg text-[9px] font-bold px-2 py-1 flex items-center gap-1">
                              <span>📸 Upload</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleLocationPhotoUpload} />
                            </label>
                            {pickupPhotoUrl && <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-[10px]">✅</div>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold text-secondary-600 uppercase tracking-wider flex items-center justify-between">
                          <span>Patokan / Catatan Jemput</span>
                          <span className="text-secondary-400 font-semibold text-[8px]">(OPSIONAL)</span>
                        </label>
                        <input
                          type="text"
                          value={pickupLandmark}
                          onChange={(e) => setPickupLandmark(e.target.value)}
                          placeholder="cth: Pagar hitam, dekat warung kelontong"
                          className="input-premium py-1.5 px-2.5 text-[11px] rounded-lg mt-1 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Menu Deteksi Lokasi Real-Time Customer via Google Maps GPS */}
                  <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-blue-400 p-4 rounded-2xl space-y-3 text-left shadow-soft">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-black text-blue-950 font-outfit uppercase tracking-wide">
                          Deteksi Lokasi Tujuan Real-Time
                        </span>
                      </div>
                      <span className="bg-blue-600 text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                        Google Maps GPS • 5m Akurat
                      </span>
                    </div>

                    <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                      Tekan tombol <strong className="text-blue-950 font-bold">&quot;Cek Lokasi Saat Ini&quot;</strong> untuk langsung menggunakan GPS Google Maps presisi 5m. Sistem akan otomatis menentukan lokasi tujuan Anda &amp; menghitung biaya ongkos kirim.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleGetDestinationLocation}
                        disabled={isLocatingDestination}
                        className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white text-xs font-black px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLocatingDestination ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Mendeteksi Lokasi Real-Time...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-4.5 h-4.5 fill-white" />
                            <span>🎯 Cek Lokasi Saat Ini (Google Maps)</span>
                          </>
                        )}
                      </button>

                      {destinationCoords && (
                        <a
                          href={`https://www.google.com/maps?q=${destinationCoords.lat},${destinationCoords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-300 text-xs font-black px-3.5 py-3 rounded-xl transition-all shadow-soft flex items-center gap-1.5 shrink-0"
                          title="Buka lokasi ini di aplikasi Google Maps"
                        >
                          <span>🗺️ Buka Google Maps</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}
                    </div>

                    {destinationAccuracy && destinationCoords && (
                      <div className="flex items-center justify-between text-[10.5px] text-emerald-900 bg-white/90 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold shadow-soft-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✅</span>
                          <span>GPS Real-time: {destinationCoords.lat.toFixed(5)}, {destinationCoords.lng.toFixed(5)}</span>
                        </span>
                        <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                          Akurasi ±{destinationAccuracy}m
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-blue-200/60 space-y-1">
                      <label className="block text-[10px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center justify-between">
                        <span>📌 Tempel Link / Koordinat Google Maps</span>
                        <span className="text-blue-700 text-[9px] font-bold">100% Akurat</span>
                      </label>
                      <input
                        type="text"
                        value={gmapsLinkInput}
                        onChange={(e) => handleParseGmapsInput(e.target.value)}
                        placeholder="Tempel link Google Maps (maps.app.goo.gl...) atau koordinat (-5.2951, 104.9752)"
                        className="w-full bg-white font-semibold text-blue-950 px-3 py-2 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-soft-xs placeholder:text-blue-300"
                      />
                    </div>
                  </div>

                  <AddressAutocomplete
                    label="Lokasi Tujuan *"
                    placeholder="Masukkan alamat tujuan atau tekan Cek Lokasi Saat Ini..."
                    value={destinationAddress}
                    onChange={(address, coords, details) => {
                      setDestinationAddress(address);
                      setDestinationCoords(coords);
                      if (details) setDestinationDetails(parseNominatimAddress(details));
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.destinationAddress;
                        return copy;
                      });
                    }}
                    error={errors.destinationAddress || (isDestOutside ? 'Titik tujuan di luar Lampung!' : undefined)}
                    icon={<Navigation className="w-4.5 h-4.5 text-red-500" />}
                    showGpsButton={true}
                    onGpsClick={handleGetDestinationLocation}
                    gpsLoading={isLocatingDestination}
                    gpsButtonLabel="Cek Lokasi (5m)"
                    onFocus={() => setActiveMarkerType('destination')}
                  />
                  {renderDetailedAddress(destinationDetails, 'Tujuan', 'destination')}

                  {/* Live Kalkulasi Ongkos Kirim Banner */}
                  {pricing && destinationCoords && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border-2 border-emerald-500 rounded-2xl flex items-center justify-between shadow-md text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span>Ongkos Kirim Otomatis Terkalkulasi!</span>
                        </div>
                        <p className="text-[11px] text-secondary-700 font-medium">
                          Jarak Rute: <strong className="text-secondary-900 font-extrabold">{formatDistance(pricing.distance)}</strong> ({formatDuration(pricing.duration)})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-secondary-500 uppercase font-black tracking-wider">Total Biaya Ongkir</p>
                        <p className="text-2xl font-black text-amber-600 font-outfit leading-tight">{formatCurrency(pricing.totalDeliveryFee)}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Service Categories */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-secondary-700 font-outfit uppercase tracking-wider flex items-center justify-between">
                  <span>Kategori Layanan</span>
                  <span className="text-red-500 font-extrabold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 tracking-wider">* WAJIB</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ORDER_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.icon];
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.id as any);
                          // Default weights for Ojek vs Logistics
                          if (cat.id === 'ride') {
                            setWeightRange('<80');
                          } else {
                            setWeightRange('0-2');
                          }
                        }}
                        className={cn(
                          'p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm',
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-amber-900 font-bold scale-[1.02]'
                            : 'border-secondary-100 hover:border-amber-300 hover:bg-secondary-50 text-secondary-600'
                        )}
                      >
                        {Icon && <Icon className={cn('w-5 h-5', isSelected ? 'text-amber-600' : 'text-secondary-400')} />}
                        <span className="text-[10px] leading-tight font-bold">{cat.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Route Options and Rules */}
              <div className="bg-secondary-50/50 p-4 border border-secondary-150 rounded-2xl space-y-3">
                <label className="block text-[10px] font-bold text-secondary-500 uppercase tracking-wider">Profil Pencarian Rute</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fastest', 'shortest', 'motorcycle'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRouteOption(opt)}
                      className={cn(
                        'py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-center',
                        routeOption === opt
                          ? 'bg-secondary-900 border-secondary-900 text-white shadow'
                          : 'bg-white border-secondary-200 text-secondary-600'
                      )}
                    >
                      {opt === 'fastest' ? '⚡ Tercepat' : opt === 'shortest' ? '📏 Terpendek' : '🛵 Rute Motor'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Inputs: Ride/Ojek vs. Cargo/Logistics */}
              <AnimatePresence mode="wait">
                {category === 'ride' ? (
                  <motion.div
                    key="ride-fields"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 bg-amber-50/10 border border-amber-200/50 rounded-2xl p-4"
                  >
                    <h4 className="text-xs font-extrabold text-secondary-800 uppercase tracking-wider font-outfit border-b border-secondary-100 pb-2">Spesifikasi Ojek</h4>
                    
                    {/* Passenger count */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-secondary-500 mb-1">Jumlah Penumpang</label>
                        <select
                          value={passengerCount}
                          onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                          className="input-premium py-2 px-2 text-xs rounded-xl bg-white"
                        >
                          <option value="1">1 Orang</option>
                          <option value="2">2 Orang</option>
                        </select>
                      </div>

                      {/* Weight Category */}
                      <div>
                        <label className="block text-[10px] font-bold text-secondary-500 mb-1">Rentang Berat Penumpang</label>
                        <select
                          value={weightRange}
                          onChange={(e) => setWeightRange(e.target.value)}
                          className="input-premium py-2 px-2 text-xs rounded-xl bg-white"
                        >
                          <option value="<80">&lt; 80 kg</option>
                          <option value="80-120">80 - 120 kg (+Rp3.000)</option>
                          <option value="120+">120 kg+ (+Rp10.000)</option>
                        </select>
                      </div>
                    </div>

                    {/* Helm selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-500 mb-1.5">Ketersediaan Helm</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOjekHelmet('need')}
                          className={cn(
                            "py-2 px-2 border rounded-xl text-xs font-bold transition-all",
                            ojekHelmet === 'need' 
                              ? "bg-amber-500 border-amber-500 text-white shadow-sm" 
                              : "bg-white border-secondary-200 text-secondary-600"
                          )}
                        >
                          Butuh Helm Driver
                        </button>
                        <button
                          type="button"
                          onClick={() => setOjekHelmet('own')}
                          className={cn(
                            "py-2 px-2 border rounded-xl text-xs font-bold transition-all",
                            ojekHelmet === 'own' 
                              ? "bg-amber-500 border-amber-500 text-white shadow-sm" 
                              : "bg-white border-secondary-200 text-secondary-600"
                          )}
                        >
                          Bawa Helm Sendiri
                        </button>
                      </div>
                    </div>

                    {/* Roundtrip & extra waiting */}
                    <div className="flex items-center justify-between py-1 border-t border-secondary-100 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="roundtrip"
                          checked={ojekRoundTrip}
                          onChange={(e) => setOjekRoundTrip(e.target.checked)}
                          className="w-4 h-4 text-amber-500 border-secondary-300 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="roundtrip" className="text-xs font-bold text-secondary-700 cursor-pointer">Perjalanan Pulang Pergi (PP)</label>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Logistics Details
                  <motion.div
                    key="logistics-fields"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 bg-secondary-50/30 border border-secondary-150 rounded-2xl p-4"
                  >
                    <h4 className="text-xs font-extrabold text-secondary-800 uppercase tracking-wider font-outfit border-b border-secondary-100 pb-2">Spesifikasi Paket & Titipan</h4>
                    
                    {/* Weight options */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-500 mb-1.5">Estimasi Berat Paket</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { val: '0-2', lbl: '0-2kg' },
                          { val: '3-5', lbl: '3-5kg (+3k)' },
                          { val: '6-10', lbl: '6-10kg (+8k)' },
                          { val: '11-20', lbl: '11-20kg (+15k)' },
                          { val: '20+', lbl: '20kg+ (+30k)' },
                        ].map((w) => (
                          <button
                            key={w.val}
                            type="button"
                            onClick={() => setWeightRange(w.val)}
                            className={cn(
                              "py-2 border rounded-xl text-[9px] font-bold text-center transition-all",
                              weightRange === w.val 
                                ? "bg-amber-500 border-amber-500 text-white shadow-sm" 
                                : "bg-white border-secondary-200 text-secondary-500"
                            )}
                          >
                            {w.lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Item list for shopping food and medicine */}
                    {['shopping', 'food', 'medicine'].includes(category) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-secondary-500 uppercase tracking-wider">Daftar Belanjaan *</label>
                          <button
                            type="button"
                            onClick={addShoppingItem}
                            className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5 hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah Barang
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {shoppingItems.map((item, idx) => (
                            <div key={item.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-secondary-200">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateShoppingItem(item.id, 'name', e.target.value)}
                                placeholder="Nama barang (cth: Apel)"
                                className="flex-1 text-[11px] font-semibold border-0 p-0 focus:ring-0"
                              />
                              <input
                                type="number"
                                value={item.quantity}
                                min={1}
                                onChange={(e) => updateShoppingItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-10 text-center text-[11px] font-bold border-0 p-0 focus:ring-0 bg-secondary-50 rounded"
                              />
                              <input
                                type="number"
                                value={item.estimatedPrice || ''}
                                onChange={(e) => updateShoppingItem(item.id, 'estimatedPrice', parseInt(e.target.value) || 0)}
                                placeholder="Harga est."
                                className="w-20 text-right text-[11px] font-semibold border-0 p-0 focus:ring-0"
                              />
                              {shoppingItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeShoppingItem(item.id)}
                                  className="text-red-400 hover:text-red-600 p-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard text description for package */}
                    {!['shopping', 'food', 'medicine'].includes(category) && (
                      <div>
                        <label className="block text-[10px] font-bold text-secondary-500 mb-1">Rincian Paket / Dokumen *</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tulis jenis paket, alamat tujuan spesifik, cth: Titipan Surat Kematian dari Kantor Desa"
                          rows={2}
                          className="input-premium py-2 px-3 text-xs resize-none bg-white rounded-xl"
                        />
                        {errors.description && <p className="text-[10px] text-red-500 mt-0.5">{errors.description}</p>}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Waiting Surcharge option */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-secondary-700 font-outfit uppercase tracking-wider">Antrean Waktu Tunggu Driver</label>
                <select
                  value={waitingMinutes}
                  onChange={(e) => setWaitingMinutes(parseInt(e.target.value) || 0)}
                  className="input-premium py-2.5 text-xs rounded-xl bg-white"
                >
                  <option value="0">Tidak Perlu Menunggu (Rp0)</option>
                  <option value="10">Mengantre ~10 Menit (+Rp5.000)</option>
                  <option value="20">Mengantre ~20 Menit (+Rp10.000)</option>
                  <option value="30">Mengantre ~30 Menit (+Rp15.000)</option>
                  <option value="60">Mengantre ~60 Menit (+Rp30.000)</option>
                </select>
                <p className="text-[9px] text-secondary-400">Pilih jika driver harus mengantre lama di warung padat, loket apotek, dll.</p>
              </div>

              {/* Pricing Custom Toggles: Holiday, Peak, Rain, Insurance */}
              <div className="bg-secondary-50/40 p-4 border border-secondary-100 rounded-2xl space-y-3 text-xs">
                <h4 className="text-xs font-bold text-secondary-800 uppercase tracking-wider font-outfit border-b border-secondary-100 pb-2">Opsi & Surcharge Tambahan</h4>
                
                {/* Rain/Weather Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>Surcharge Cuaca Hujan (+Rp3.000)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasRain}
                    onChange={(e) => setHasRain(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-secondary-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Holiday Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>Surcharge Hari Libur (+Rp2.000)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasHoliday}
                    onChange={(e) => setHasHoliday(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-secondary-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Peak Hour Surcharge Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Surcharge Jam Sibuk (+Rp3.000)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasPeakHour}
                    onChange={(e) => setHasPeakHour(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-secondary-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Insurance Surcharge Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Asuransi Layanan JSS (+Rp1.000)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasInsurance}
                    onChange={(e) => setHasInsurance(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-secondary-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Promo Code Discount */}
              <div className="bg-amber-500/5 p-4 border border-amber-500/10 rounded-2xl space-y-2">
                <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">Gunakan Kode Promo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="cth: JSSPERDANA"
                    className="flex-1 input-premium py-2 px-2.5 text-xs rounded-xl bg-white uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-amber-500 text-secondary-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    Terapkan
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Kode promo &quot;{appliedPromo}&quot; aktif.
                  </p>
                )}
              </div>

              {/* Payment selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-secondary-700 font-outfit uppercase tracking-wider flex items-center justify-between">
                  <span>Metode Pembayaran</span>
                  <span className="text-red-500 font-extrabold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 tracking-wider">* WAJIB</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = PAYMENT_ICONS[method.icon];
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          'p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 shadow-sm',
                          isSelected
                            ? 'border-secondary-900 bg-secondary-50 text-secondary-900 font-bold'
                            : 'border-secondary-100 hover:border-secondary-300 text-secondary-500 bg-white'
                        )}
                      >
                        {Icon && <Icon className="w-4 h-4 text-secondary-700" />}
                        <span className="text-[9px] leading-tight font-bold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit triggers confirmation modal & Quick Download */}
              <div className="flex gap-2.5 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="flex-1 btn-primary text-sm py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 rounded-2xl shadow-golden"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menghitung Rute...
                    </>
                  ) : (
                    <>
                      Pesan Sekarang <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {pricing && (
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    disabled={isDownloadingReceipt}
                    className="bg-secondary-900 hover:bg-secondary-800 text-amber-400 font-bold px-4 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 border border-amber-500/30 shrink-0"
                    title="Download Struk Konfirmasi (PNG)"
                  >
                    {isDownloadingReceipt ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Download className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="font-bold">Download Struk</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL (Desktop Map) or Background Map */}
        <div className="flex-1 relative z-0 h-[50vh] lg:h-[calc(100vh-80px)]">
          <OrderMapPreview
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            distanceText={pricing ? formatDistance(pricing.distance) : undefined}
            durationText={pricing ? formatDuration(pricing.duration) : undefined}
            routeCoordinates={routeCoordinates}
            onPickupChange={handlePickupCoordsChange}
            onDestinationChange={handleDestinationCoordsChange}
            onClickMap={(coords) => {
              if (activeMarkerType === 'destination') {
                handleDestinationCoordsChange(coords);
              } else {
                handlePickupCoordsChange(coords);
              }
            }}
            activeMarkerType={activeMarkerType}
            onActiveMarkerTypeChange={setActiveMarkerType}
          />
        </div>

      </div>

      {/* Confirmation Slide-up Modal */}
      <AnimatePresence>
        {showConfirmModal && pricing && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              id="jss-confirm-modal-card"
              className="bg-white rounded-card overflow-hidden border border-secondary-150 shadow-soft-xl max-w-lg w-full flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-secondary-900 p-5 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-outfit text-white">Konfirmasi Pemesanan JSS</h3>
                  <p className="text-[10px] text-secondary-300">Harap tinjau rincian biaya dan rute sebelum mengirim ke WhatsApp</p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-secondary-400 hover:text-white text-lg p-1.5 hover:bg-secondary-800 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Content scrollable */}
              <div className="p-6 overflow-y-auto space-y-4.5 text-left text-xs leading-relaxed">
                
                {/* Rute preview */}
                <div className="space-y-3 bg-secondary-50/50 p-4 border border-secondary-100 rounded-2xl">
                  <div className="space-y-1.5 border-b border-secondary-100 pb-2">
                    <span className="text-[9px] uppercase font-extrabold text-secondary-400">Titik Jemput</span>
                    <p className="font-bold text-secondary-800 leading-snug">{pickupAddress}</p>
                    {pickupLandmark && <p className="text-[10px] text-amber-600 font-semibold">📍 Patokan: {pickupLandmark}</p>}
                    {renderDetailedAddress(pickupDetails, 'Jemput')}
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] uppercase font-extrabold text-secondary-400">Titik Tujuan</span>
                    <p className="font-bold text-secondary-800 leading-snug">{destinationAddress}</p>
                    {renderDetailedAddress(destinationDetails, 'Tujuan')}
                  </div>
                </div>

                {/* Travel stats */}
                <div className="grid grid-cols-3 gap-2 bg-secondary-900/5 border border-secondary-150 p-3 rounded-2xl text-center">
                  <div>
                    <span className="block text-[8px] font-bold text-secondary-400 uppercase tracking-wider">Jarak Rute</span>
                    <span className="text-xs font-extrabold text-secondary-800">{formatDistance(pricing.distance)}</span>
                  </div>
                  <div className="border-x border-secondary-200">
                    <span className="block text-[8px] font-bold text-secondary-400 uppercase tracking-wider">Estimasi Perjalanan</span>
                    <span className="text-xs font-extrabold text-secondary-800">{formatDuration(pricing.duration)}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-secondary-400 uppercase tracking-wider">ETA Jemput Driver</span>
                    <span className="text-xs font-extrabold text-secondary-800">~{Math.round(5 + pricing.distance / 1500)} menit</span>
                  </div>
                </div>

                {/* Fees Itemization Breakdown */}
                <div className="space-y-2 bg-white border border-secondary-150 p-4 rounded-2xl shadow-sm">
                  <h4 className="text-[10px] font-extrabold text-secondary-450 uppercase tracking-wider border-b border-secondary-100 pb-1.5 mb-2">Rincian Ongkos Kirim</h4>
                  
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-secondary-500 shrink-0">Tarif Dasar ({category === 'ride' ? 'Ojek' : 'Logistik'})</span>
                    <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.baseFee)}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-secondary-500 shrink-0">Tarif Jarak Tempuh</span>
                    <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.distanceFee)}</span>
                  </div>

                  {pricing.weightFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Surcharge Berat ({weightRange} kg)</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.weightFee)}</span>
                    </div>
                  )}

                  {(pricing.shoppingFee > 0 || ['shopping', 'food', 'medicine'].includes(category)) && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Jasa Titip Belanja</span>
                      {pricing.shoppingFee > 0 ? (
                        <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.shoppingFee)}</span>
                      ) : (
                        <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs tracking-wide uppercase whitespace-nowrap">
                          GRATIS
                        </span>
                      )}
                    </div>
                  )}

                  {pricing.waitingFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Biaya Tunggu Driver Antrean</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.waitingFee)}</span>
                    </div>
                  )}

                  {pricing.rainFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Surcharge Cuaca Hujan</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.rainFee)}</span>
                    </div>
                  )}

                  {pricing.holidayFee && pricing.holidayFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Surcharge Hari Libur</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.holidayFee)}</span>
                    </div>
                  )}

                  {pricing.peakHourFee && pricing.peakHourFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Surcharge Jam Sibuk</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.peakHourFee)}</span>
                    </div>
                  )}

                  {pricing.serviceFee && pricing.serviceFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Biaya Layanan Platform</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.serviceFee)}</span>
                    </div>
                  )}

                  {pricing.insuranceFee && pricing.insuranceFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-secondary-500 shrink-0">Asuransi Perjalanan JSS</span>
                      <span className="font-bold text-secondary-800 text-right whitespace-nowrap">{formatCurrency(pricing.insuranceFee)}</span>
                    </div>
                  )}

                  {pricing.isRoundTrip && pricing.roundTripFee && pricing.roundTripFee > 0 && (
                    <div className="flex justify-between items-center gap-2 text-amber-700 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-200 mt-1">
                      <span>Perjalanan Pulang Pergi (PP 2x)</span>
                      <span className="whitespace-nowrap">+{formatCurrency(pricing.roundTripFee)}</span>
                    </div>
                  )}

                  {pricing.promoDiscount && pricing.promoDiscount > 0 && (
                    <div className="flex justify-between items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 mt-1">
                      <span>Promo Discount ({appliedPromo})</span>
                      <span className="whitespace-nowrap">-{formatCurrency(pricing.promoDiscount)}</span>
                    </div>
                  )}

                  {category !== 'ride' && totalItemPrice > 0 && (
                    <div className="flex justify-between items-center gap-2 text-secondary-500 border-t border-dashed pt-2 mt-2">
                      <span>Estimasi Budget Belanja</span>
                      <span className="whitespace-nowrap">{formatCurrency(totalItemPrice)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-secondary-100 font-extrabold text-sm text-secondary-900">
                    <span>Grand Total Tagihan</span>
                    <span className="text-lg text-primary-700 font-outfit whitespace-nowrap">{formatCurrency(pricing.grandTotal)}</span>
                  </div>
                </div>

                {/* Payment & disclaimer */}
                <div className="flex justify-between items-center p-3 border border-secondary-150 rounded-2xl bg-secondary-50/50">
                  <span className="font-bold text-secondary-700">Metode Pembayaran:</span>
                  <span className="font-extrabold text-secondary-900 bg-white border border-secondary-200 px-3 py-1 rounded-xl shadow-sm uppercase tracking-wide">
                    {paymentMethod === 'cash' ? '💵 Tunai (COD)' : paymentMethod === 'qris' ? '📱 QRIS' : '🏦 Transfer'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-5 bg-secondary-50 border-t border-secondary-150 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-outline py-3 px-4 text-xs font-bold sm:flex-initial"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="bg-secondary-800 hover:bg-secondary-900 text-white font-bold py-3 px-4 rounded-button text-xs flex items-center justify-center gap-2 transition-all shadow-sm flex-1 disabled:opacity-50"
                >
                  {isDownloadingReceipt ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-amber-400" />
                  )}
                  Download Struk
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="btn-primary py-3 px-4 rounded-button text-xs flex items-center justify-center gap-2 shadow-golden flex-1 font-bold"
                >
                  <MessageCircle className="w-4 h-4 text-secondary-900" />
                  Kirim ke WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
