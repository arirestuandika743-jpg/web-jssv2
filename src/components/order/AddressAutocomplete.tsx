'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2, AlertCircle, X, Trash2, Star, Home, Briefcase, GraduationCap, Heart } from 'lucide-react';
import type { LatLng } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseNominatimAddress } from '@/services/maps';

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (address: string, coords: LatLng | null, details?: any) => void;
  error?: string;
  icon?: React.ReactNode;
  showGpsButton?: boolean;
  onGpsClick?: () => void;
  gpsLoading?: boolean;
  onFocus?: () => void;
}

interface NominatimSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  mainText: string;
  secondaryText: string;
  address?: any;
  parsedDetails?: any;
}

interface FavoriteLocation {
  address: string;
  coords: LatLng;
  displayName: string;
  details?: any;
}

type FavoriteKey = 'Rumah' | 'Kantor' | 'Sekolah' | 'Pacar' | 'Favorit';

const FAVORITE_KEYS: { key: FavoriteKey; label: string; icon: any }[] = [
  { key: 'Rumah', label: 'Rumah', icon: Home },
  { key: 'Kantor', label: 'Kantor', icon: Briefcase },
  { key: 'Sekolah', label: 'Sekolah', icon: GraduationCap },
  { key: 'Pacar', label: 'Pacar', icon: Heart },
  { key: 'Favorit', label: 'Favorit', icon: Star },
];

const PRIORITIES = [
  'Bandar Lampung',
  'Bandar Jaya',
  'Kalirejo',
  'Metro',
  'Pringsewu',
  'Kotabumi',
  'Gadingrejo',
  'Negeri Katon',
  'Kotagajah',
  'Gunung Sugih',
  'Trimurjo',
  'Punggur',
  'Way Pengubuan',
  'Terbanggi Besar',
  'Lampung Tengah',
  'Lampung Selatan',
  'Lampung Timur',
  'Pesawaran',
  'Tanggamus',
  'Way Kanan',
  'Mesuji',
  'Pesisir Barat'
];

function getScore(displayName: string) {
  let score = 0;
  const nameLower = displayName.toLowerCase();
  
  if (nameLower.includes('lampung')) {
    score += 1000;
  }
  
  for (const prio of PRIORITIES) {
    if (nameLower.includes(prio.toLowerCase())) {
      score += 100;
    }
  }
  
  return score;
}

export function getLocationIcon(displayName: string): string {
  const name = displayName.toLowerCase();
  if (name.includes('spbu') || name.includes('pertamina') || name.includes('bensin') || name.includes('gas station')) return '⛽';
  if (name.includes('cafe') || name.includes('warkop') || name.includes('kopi')) return '☕';
  if (name.includes('masjid') || name.includes('musholla') || name.includes('mosque')) return '🕌';
  if (name.includes('gereja') || name.includes('church')) return '⛪';
  if (name.includes('rumah sakit') || name.includes('hospital') || name.includes('klinik') || name.includes('puskesmas') || name.includes('rsud') || name.includes('rs ')) return '🏥';
  if (name.includes('apotek') || name.includes('pharmacy') || name.includes('apotik')) return '💊';
  if (name.includes('hotel') || name.includes('penginapan') || name.includes('guesthouse') || name.includes('resort')) return '🏨';
  if (name.includes('kantor') || name.includes('office') || name.includes('balai') || name.includes('kecamatan') || name.includes('kelurahan')) return '🏢';
  if (name.includes('sekolah') || name.includes('sdn ') || name.includes('smpn ') || name.includes('sman ') || name.includes('school')) return '🏫';
  if (name.includes('terminal') || name.includes('halte') || name.includes('bus station')) return '🚏';
  if (name.includes('bandara') || name.includes('airport') || name.includes('lapangan terbang')) return '🛫';
  if (name.includes('pelabuhan') || name.includes('harbor') || name.includes('port') || name.includes('dermaga')) return '🚢';
  if (name.includes('mall') || name.includes('plaza') || name.includes('supermarket')) return '🏬';
  if (name.includes('pasar') || name.includes('market') || name.includes('kedai') || name.includes('toko') || name.includes('warung') || name.includes('mart')) return '🛒';
  if (name.includes('universitas') || name.includes('kampus') || name.includes('college') || name.includes('academy') || name.includes('politeknik')) return '🎓';
  if (name.includes('taman') || name.includes('park') || name.includes('alun-alun')) return '🌳';
  if (name.includes('stasiun') || name.includes('station')) return '🚉';
  if (name.includes('rumah') || name.includes('home') || name.includes('residence') || name.includes('perumahan')) return '🏠';
  return '📍';
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="text-amber-500 font-extrabold">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  showGpsButton = false,
  onGpsClick,
  gpsLoading = false,
  onFocus,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Record<string, NominatimSuggestion[]>>({});

  // History & Favorites States
  const [history, setHistory] = useState<NominatimSuggestion[]>([]);
  const [favorites, setFavorites] = useState<Record<FavoriteKey, FavoriteLocation | null>>({
    Rumah: null,
    Kantor: null,
    Sekolah: null,
    Pacar: null,
    Favorit: null,
  });

  const [activeAddressDetails, setActiveAddressDetails] = useState<any>(null);
  const [activeCoords, setActiveCoords] = useState<LatLng | null>(null);

  // Sync value prop to query state
  useEffect(() => {
    setQuery(value);
    if (!value) {
      setActiveCoords(null);
      setActiveAddressDetails(null);
    }
  }, [value]);

  // Load history and favorites
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('jss_search_history');
      if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
      }

      const loadedFavs: any = {};
      FAVORITE_KEYS.forEach(({ key }) => {
        const saved = localStorage.getItem('jss_fav_' + key);
        if (saved) {
          try { loadedFavs[key] = JSON.parse(saved); } catch (e) {}
        }
      });
      setFavorites(prev => ({ ...prev, ...loadedFavs }));
    }
  }, []);

  // Fetch predictions with debounce
  useEffect(() => {
    if (query.trim().length < 2 || query === value) {
      setSuggestions([]);
      return;
    }

    if (cache.current[query]) {
      setSuggestions(cache.current[query]);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        let data: any = null;
        try {
          const proxyRes = await fetch(`/api/geocode?type=search&q=${encodeURIComponent(query)}`);
          if (proxyRes.ok) {
            data = await proxyRes.json();
          }
        } catch (e) {
          console.warn('Proxy search failed, using direct fallback:', e);
        }

        if (!data || !Array.isArray(data)) {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=id&format=json&addressdetails=1&limit=15`
          );
          data = await res.json();
        }

        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => {
            const parsed = parseNominatimAddress(item);
            const mainText = parsed.name || parsed.road || parsed.village || item.display_name.split(',')[0].trim();
            
            const secondaryParts = [
              parsed.village ? (parsed.village.toLowerCase().includes('desa') || parsed.village.toLowerCase().includes('kel') ? parsed.village : `Desa/Kel. ${parsed.village}`) : null,
              parsed.subdistrict ? (parsed.subdistrict.toLowerCase().includes('kec') ? parsed.subdistrict : `Kec. ${parsed.subdistrict}`) : null,
              parsed.county ? (parsed.county.toLowerCase().includes('kota') || parsed.county.toLowerCase().includes('kab') ? parsed.county : `Kab. ${parsed.county}`) : null,
              parsed.state ? (parsed.state.toLowerCase().includes('prov') ? parsed.state : `Prov. ${parsed.state}`) : null,
            ].filter(Boolean);

            const secondaryText = secondaryParts.length > 0 
              ? secondaryParts.join(', ') 
              : item.display_name.split(',').slice(1).join(',').trim();

            return {
              place_id: String(item.place_id),
              display_name: parsed.formattedAddress || item.display_name,
              lat: item.lat,
              lon: item.lon,
              mainText,
              secondaryText,
              address: item.address,
              parsedDetails: parsed,
            };
          });

          // Sort by Lampung priorities
          formatted.sort((a, b) => getScore(b.display_name) - getScore(a.display_name));

          cache.current[query] = formatted;
          setSuggestions(formatted);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Nominatim search error:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, value]);

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Handle suggestion select
  const handleSelect = (item: NominatimSuggestion) => {
    const address = item.display_name;
    setQuery(item.display_name);
    setIsOpen(false);
    
    const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    setActiveCoords(coords);
    setActiveAddressDetails(item.parsedDetails || item);

    // Save to history
    const filtered = history.filter(h => h.display_name !== item.display_name);
    const updatedHistory = [item, ...filtered].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('jss_search_history', JSON.stringify(updatedHistory));

    onChange(address, coords, item.parsedDetails || item);
  };

  // Select favorite
  const handleSelectFavorite = (key: FavoriteKey) => {
    const fav = favorites[key];
    if (fav) {
      setQuery(fav.displayName);
      setIsOpen(false);
      setActiveCoords(fav.coords);
      setActiveAddressDetails(fav.details);
      onChange(fav.address, fav.coords, fav.details);
      toast.success(`Menggunakan lokasi ${key}`);
    } else {
      // Save current active coords as favorite if available
      if (activeCoords && value) {
        const favData: FavoriteLocation = {
          address: value,
          coords: activeCoords,
          displayName: query || value.split(',')[0],
          details: activeAddressDetails,
        };
        setFavorites(prev => {
          const updated = { ...prev, [key]: favData };
          localStorage.setItem('jss_fav_' + key, JSON.stringify(favData));
          return updated;
        });
        toast.success(`Menyimpan lokasi ${key}!`);
      } else {
        toast.warning(`Cari alamat atau ketik lokasi dulu untuk disimpan sebagai ${key}`);
      }
    }
  };

  const handleRemoveFavorite = (key: FavoriteKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = { ...prev, [key]: null };
      localStorage.removeItem('jss_fav_' + key);
      return updated;
    });
    toast.info(`Lokasi ${key} dihapus.`);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem('jss_search_history');
    toast.info('Riwayat pencarian dihapus.');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const list = suggestions.length > 0 ? suggestions : history;
    if (list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < list.length) {
        handleSelect(list[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const renderLabel = () => {
    if (typeof label !== 'string') return label;
    if (label.includes('*')) {
      const cleanText = label.replace('*', '').trim();
      return (
        <span className="flex items-center gap-1">
          <span>{cleanText}</span>
          <span className="text-red-500 font-extrabold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-wider">
            * WAJIB
          </span>
        </span>
      );
    }
    return label;
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-bold text-secondary-700 font-outfit">
          {renderLabel()}
        </label>
        {showGpsButton && (
          <button
            type="button"
            onClick={onGpsClick}
            disabled={gpsLoading}
            className="text-[10px] font-bold text-primary hover:text-primary-600 disabled:opacity-40 transition-all flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-xl shadow-soft"
          >
            {gpsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              <span className="text-xs">📍</span>
            )}
            Gunakan GPS
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary z-10 pointer-events-none">
          {icon || <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            if (!e.target.value) {
              onChange('', null);
              setActiveCoords(null);
              setActiveAddressDetails(null);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            if (onFocus) onFocus();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'input-premium pl-11 pr-10 bg-white transition-all text-sm font-semibold rounded-2xl border-secondary-200 py-3',
            error && 'ring-2 ring-red-400 border-red-400',
            isOpen && 'shadow-soft-lg'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('', null);
              setActiveCoords(null);
              setActiveAddressDetails(null);
              setSuggestions([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 bg-secondary-100 hover:bg-secondary-200 p-0.5 rounded-full z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Favorite tags row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
        {FAVORITE_KEYS.map(({ key, icon: IconComponent }) => {
          const isSaved = !!favorites[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectFavorite(key)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-xl transition-all border shadow-sm relative group',
                isSaved 
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800' 
                  : 'bg-white hover:bg-secondary-50 border-secondary-200 text-secondary-500'
              )}
              title={isSaved ? `Gunakan ${key}: ${favorites[key]?.address}` : `Klik untuk simpan alamat saat ini sebagai ${key}`}
            >
              <IconComponent className={cn('w-3.5 h-3.5', isSaved ? 'text-amber-500 fill-amber-500/20' : 'text-secondary-400')} />
              <span>{key}</span>
              {isSaved && (
                <span
                  onClick={(e) => handleRemoveFavorite(key, e)}
                  className="ml-1 text-secondary-400 hover:text-red-500 rounded-full hover:bg-secondary-200 p-0.5"
                  title={`Hapus ${key}`}
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Suggestions and History Popup */}
      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || (query.trim().length === 0 && history.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-soft-xl border border-secondary-150 overflow-hidden max-h-72 overflow-y-auto mt-1"
          >
            {/* suggestions search */}
            {suggestions.length > 0 ? (
              <div className="py-1">
                {suggestions.map((pred, i) => {
                  const isActive = i === activeIndex;
                  const locIcon = getLocationIcon(pred.display_name);

                  return (
                    <button
                      type="button"
                      key={pred.place_id}
                      onClick={() => handleSelect(pred)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-secondary-50/50 last:border-b-0',
                        isActive ? 'bg-amber-50/70' : 'hover:bg-secondary-50/50'
                      )}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary-100 text-base shadow-sm flex-shrink-0">
                        {locIcon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-secondary-900 truncate">
                          <HighlightedText text={pred.mainText} highlight={query} />
                        </span>
                        <span className="block text-[10px] text-secondary-400 truncate mt-0.5">
                          {pred.secondaryText}
                        </span>
                      </div>
                      <span className="text-secondary-300 text-xs">↗</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Search History
              <div className="py-1.5">
                <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-extrabold text-secondary-400 uppercase tracking-wider">
                  <span>Pencarian Terakhir</span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Hapus
                  </button>
                </div>
                {history.map((pred, i) => {
                  const isActive = i === activeIndex;
                  const locIcon = getLocationIcon(pred.display_name);

                  return (
                    <button
                      type="button"
                      key={`hist-${pred.place_id}-${i}`}
                      onClick={() => handleSelect(pred)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                        isActive ? 'bg-amber-50/70' : 'hover:bg-secondary-50/50'
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary-50 text-sm flex-shrink-0">
                        {locIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-secondary-800 truncate">
                          {pred.mainText}
                        </span>
                        <span className="block text-[9px] text-secondary-400 truncate mt-0.5">
                          {pred.secondaryText}
                        </span>
                      </div>
                      <span className="text-secondary-300 text-[10px] italic">riwayat</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
