import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, SlidersHorizontal, Star,
  MapPin, RotateCcw, ChevronDown, Car, Zap, Heart,
  UserCircle, Plane, Briefcase, Menu, Check
} from 'lucide-react';
import { LuxeWayMap } from '@/components/map/LuxeWayMap';
import { vehicleService } from '@/services/vehicleService';
import { useUIStore } from '@/store';
import type { VehicleFilters, VehicleCategory, VehicleLocationResponse } from '@/types';
import { formatCurrency, cn } from '@/utils';

// ── Constants ────────────────────────────────────────────────────────────────
const CAR_CATEGORIES: { value: VehicleCategory; label: string; icon: string }[] = [
  { value: 'economy', label: 'Economy', icon: '🚗' },
  { value: 'sedan', label: 'Sedan', icon: '🚘' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'mpv', label: 'MPV', icon: '🚐' },
  { value: 'luxury', label: 'Luxury', icon: '💎' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'electric', label: 'Electric', icon: '⚡' },
  { value: 'sports', label: 'Sports', icon: '🏎️' },
  { value: 'pickup', label: 'Pickup', icon: '🛻' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
];

const CAR_BRANDS = [
  'Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Ford',
  'Mitsubishi', 'Nissan', 'Suzuki', 'VinFast', 'MG',
  'Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Porsche',
  'Peugeot', 'Volvo', 'Chevrolet', 'Subaru',
];

const MOTORBIKE_BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'SYM', 'Piaggio', 'Ducati',
  'Kawasaki', 'Vespa', 'Peugeot Motocycles', 'Royal Enfield',
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'newest', label: 'Mới nhất' },
];

const CITY_COORDS: Record<string, [number, number]> = {
  'hồ chí minh': [106.7020, 10.7779],
  'hcm': [106.7020, 10.7779],
  'hà nội': [105.8542, 21.0285],
  'hn': [105.8542, 21.0285],
  'đà nẵng': [108.2200, 16.0478],
  'nha trang': [109.1965, 12.2415],
  'đà lạt': [108.4385, 11.9412],
};

// ── Filter Drawer (identical logic to CarsMarketplace CarFilterPanel) ────────
const MapFilterDrawer: React.FC<{
  filters: VehicleFilters;
  onChange: (f: VehicleFilters) => void;
  onClose: () => void;
}> = ({ filters, onChange, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice ?? 0,
    filters.maxPrice ?? 5000000,
  ]);

  const isMotorbike = filters.vehicleType === 'motorbike';

  const toggle = (key: keyof VehicleFilters, val: any) => {
    const arr: any[] = (filters as any)[key] || [];
    const next = arr.includes(val) ? arr.filter((x: any) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next.length > 0 ? next : undefined });
  };

  const toggleBool = (key: keyof VehicleFilters) =>
    onChange({ ...filters, [key]: !(filters as any)[key] || undefined });

  const formatVND = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(n);

  const brands = isMotorbike ? MOTORBIKE_BRANDS : CAR_BRANDS;

  return (
    <motion.div
      key="drawer"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed right-0 top-0 bottom-0 w-full sm:w-[340px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[200] flex flex-col"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-500" />
          {isMotorbike ? 'Lọc Xe Máy' : 'Lọc Xe Ô Tô'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ vehicleType: filters.vehicleType })}
            className="text-xs text-blue-500 hover:underline font-bold"
          >
            Xóa lọc
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 scrollbar-none">

        {/* Vehicle Type */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Loại Xe</p>
          <div className="flex gap-2">
            {[
              { value: '', label: 'Tất cả' },
              { value: 'car', label: '🚗 Ô Tô' },
              { value: 'motorbike', label: '🏍️ Xe Máy' },
            ].map(opt => {
              const sel = (filters.vehicleType ?? '') === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filters, vehicleType: (opt.value as any) || undefined })}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                    sel
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories (cars only) */}
        {!isMotorbike && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Dòng Xe</p>
            <div className="grid grid-cols-2 gap-2">
              {CAR_CATEGORIES.map(cat => {
                const sel = (filters.category || []).includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggle('category', cat.value)}
                    className={cn(
                      'px-2 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5',
                      sel
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price range */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá / Ngày</p>
            <span className="text-xs font-bold text-slate-700 dark:text-white">
              {formatVND(priceRange[0])} – {formatVND(priceRange[1])}
            </span>
          </div>
          <input
            type="range" min={0} max={5000000} step={50000} value={priceRange[0]}
            onChange={e => {
              const v = Math.min(Number(e.target.value), priceRange[1] - 100000);
              setPriceRange([v, priceRange[1]]);
              onChange({ ...filters, minPrice: v > 0 ? v : undefined });
            }}
            className="w-full accent-blue-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2"
          />
          <input
            type="range" min={0} max={5000000} step={50000} value={priceRange[1]}
            onChange={e => {
              const v = Math.max(Number(e.target.value), priceRange[0] + 100000);
              setPriceRange([priceRange[0], v]);
              onChange({ ...filters, maxPrice: v < 5000000 ? v : undefined });
            }}
            className="w-full accent-blue-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>0đ</span><span>2.5tr</span><span>5tr</span>
          </div>
        </div>

        {/* Seats (cars only) */}
        {!isMotorbike && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Số Chỗ Ngồi</p>
            <div className="grid grid-cols-4 gap-2">
              {[{ label: '4 chỗ', val: 4 }, { label: '5 chỗ', val: 5 }, { label: '7 chỗ', val: 7 }, { label: '9+ chỗ', val: 9 }].map(seat => {
                const sel = filters.minSeats === seat.val;
                return (
                  <button
                    key={seat.val}
                    onClick={() => onChange({ ...filters, minSeats: sel ? undefined : seat.val })}
                    className={cn(
                      'py-2 rounded-xl text-xs font-bold border transition-all',
                      sel
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {seat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Transmission */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Hộp Số</p>
          <div className="flex gap-2">
            {(['automatic', 'manual'] as const).map(t => {
              const sel = (filters.transmission || []).includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onChange({ ...filters, transmission: sel ? undefined : [t] })}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                    sel
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {t === 'automatic' ? 'Tự Động' : 'Số Sàn'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Nhiên Liệu</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'gasoline', label: '⛽ Xăng' },
              { value: 'diesel', label: '🛢️ Dầu' },
              { value: 'electric', label: '⚡ Điện' },
            ].map(fuel => {
              const sel = (filters.fuelType || []).includes(fuel.value as any);
              return (
                <button
                  key={fuel.value}
                  onClick={() => onChange({ ...filters, fuelType: sel ? undefined : [fuel.value as any] })}
                  className={cn(
                    'py-2 rounded-xl text-xs font-bold border transition-all',
                    sel
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {fuel.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brands */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Hãng Xe</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {brands.map(brand => {
              const checked = (filters.brands || []).includes(brand);
              return (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle('brands', brand)}
                    className="rounded text-blue-500 accent-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Special Options */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Tính Năng & Dịch Vụ</p>
          <div className="space-y-2">
            {(isMotorbike ? [
              { key: 'hasHelmet', icon: '🪖', label: 'Có mũ bảo hiểm' },
              { key: 'hasRaincoat', icon: '🧥', label: 'Có áo mưa' },
              { key: 'hasPhoneHolder', icon: '📱', label: 'Giá đỡ điện thoại' },
              { key: 'hasTouringPackage', icon: '🗺️', label: 'Gói du lịch' },
              { key: 'instantBook', icon: '⚡', label: 'Đặt Ngay' },
            ] : [
              { key: 'hasChauffeur', icon: '👤', label: 'Có Tài Xế Riêng' },
              { key: 'airportDelivery', icon: '✈️', label: 'Giao Xe Sân Bay' },
              { key: 'weddingRental', icon: '💍', label: 'Phục Vụ Đám Cưới' },
              { key: 'businessRental', icon: '💼', label: 'Xe Doanh Nghiệp' },
              { key: 'instantBook', icon: '⚡', label: 'Đặt Ngay' },
            ]).map(f => (
              <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!(filters as any)[f.key]}
                  onChange={() => toggleBool(f.key as keyof VehicleFilters)}
                  className="rounded text-blue-500 accent-blue-500 w-4 h-4"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                  <span>{f.icon}</span>{f.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Min Rating */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Đánh Giá Tối Thiểu</p>
          <div className="flex gap-2">
            {[4.0, 4.5, 4.8].map(r => (
              <button
                key={r}
                onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? undefined : r })}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all',
                  filters.minRating === r
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                ⭐ {r}+
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 flex-shrink-0">
        <button
          onClick={() => { onChange({ vehicleType: filters.vehicleType }); onClose(); }}
          className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Thiết lập lại
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wide transition-colors shadow-lg"
        >
          Áp dụng
        </button>
      </div>
    </motion.div>
  );
};

// ── MapPage ────────────────────────────────────────────────────────────────────
export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  // Filters
  const [filters, setFilters] = useState<VehicleFilters>(() => {
    const f: VehicleFilters = {};
    const loc = searchParams.get('location') || searchParams.get('city');
    if (loc) f.location = loc;
    const type = searchParams.get('type') as any;
    if (type) f.vehicleType = type;
    const brand = searchParams.get('brand');
    if (brand) f.brands = [brand];
    const mp = searchParams.get('maxPrice');
    if (mp) f.maxPrice = Number(mp);
    const kw = searchParams.get('keyword');
    if (kw) f.keyword = kw;
    const sort = searchParams.get('sort') as any;
    if (sort) f.sortBy = sort;
    return f;
  });

  // Data
  const [vehicles, setVehicles] = useState<VehicleLocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocationResponse | null>(null);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortLabel, setSortLabel] = useState('Phổ biến nhất');
  const [mapBounds, setMapBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleBoundsChange = useCallback((b: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    setMapBounds(b);
    setShowSearchAreaButton(true);
  }, []);

  const handleSearchThisArea = () => {
    if (!mapBounds) return;
    setFilters(f => ({
      ...f,
      minLat: mapBounds.minLat,
      maxLat: mapBounds.maxLat,
      minLng: mapBounds.minLng,
      maxLng: mapBounds.maxLng,
    }));
    setShowSearchAreaButton(false);
  };

  // Fetch vehicles
  const fetchVehicles = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await vehicleService.getAll(filters, 1, 500);
      const data = res.data;
      setVehicles(data as any);
      if (data && data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0] as any);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Map fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    fetchVehicles(controller.signal);
    return () => controller.abort();
  }, [fetchVehicles]);

  // Sync filters → URL
  useEffect(() => {
    const p: Record<string, string> = {};
    if (filters.location) p.location = filters.location;
    if (filters.vehicleType) p.type = filters.vehicleType;
    if (filters.brands?.length) p.brand = filters.brands[0];
    if (filters.maxPrice) p.maxPrice = String(filters.maxPrice);
    if (filters.keyword) p.keyword = filters.keyword;
    if (filters.sortBy) p.sort = filters.sortBy;
    const sd = searchParams.get('startDate');
    const ed = searchParams.get('endDate');
    if (sd) p.startDate = sd;
    if (ed) p.endDate = ed;
    setSearchParams(p, { replace: true });
  }, [filters]);

  const handleFilterChange = (newF: VehicleFilters) => setFilters(newF);

  const handleMarkerClick = (v: any) => {
    setSelectedVehicle(v);
    const idx = vehicles.findIndex(x => x.id === v.id);
    if (idx !== -1 && carouselRef.current) {
      carouselRef.current.scrollTo({ left: idx * 310, behavior: 'smooth' });
    }
  };

  const handleVehicleNavigate = (v: any) => {
    setSelectedVehicle(v);
    if (v && v.id) {
      navigate(`/vehicles/${v.id}`);
    }
  };

  const flyTo = (loc: string) => {
    const key = Object.keys(CITY_COORDS).find(k => loc.toLowerCase().includes(k));
    if (!key) return;
    const [lng, lat] = CITY_COORDS[key];
    const map = (window as any).luxewayMapInstance;
    if (map) map.flyTo({ center: [lng, lat], zoom: 12.5, duration: 1400 });
  };

  const handleSortChange = (opt: typeof SORT_OPTIONS[0]) => {
    setSortLabel(opt.label);
    setFilters(f => ({ ...f, sortBy: opt.value as any }));
    setShowSort(false);
  };

  const goToMarketplace = () => {
    const q = new URLSearchParams();
    if (filters.location) q.set('location', filters.location);
    if (filters.vehicleType) q.set('type', filters.vehicleType);
    if (filters.brands?.length) q.set('brand', filters.brands[0]);
    navigate(`/marketplace?${q.toString()}`);
  };

  // Quick filter pills data
  const quickPills = [
    {
      id: 'type',
      label: filters.vehicleType === 'car' ? '🚗 Ô Tô' : filters.vehicleType === 'motorbike' ? '🏍️ Xe Máy' : 'Loại xe',
      active: !!filters.vehicleType,
      dropdown: true,
    },
    {
      id: 'brand',
      label: filters.brands?.length ? `Hãng: ${filters.brands[0]}` : 'Hãng xe',
      active: !!filters.brands?.length,
      dropdown: false,
      onClick: () => setShowFilters(true),
    },
    {
      id: 'hourly', label: 'Thuê giờ', active: false,
      onClick: () => {},
    },
    {
      id: 'delivery', label: 'Giao nhận tận nơi',
      active: !!filters.deliveryAvailable,
      onClick: () => setFilters(f => ({ ...f, deliveryAvailable: f.deliveryAvailable ? undefined : true })),
    },
    {
      id: 'fiveStar', label: 'Chủ xe 5 ★',
      active: filters.minRating === 4.8,
      onClick: () => setFilters(f => ({ ...f, minRating: f.minRating === 4.8 ? undefined : 4.8 })),
    },
    {
      id: 'instant', label: 'Đặt xe nhanh',
      active: !!filters.instantBook,
      onClick: () => setFilters(f => ({ ...f, instantBook: f.instantBook ? undefined : true })),
    },
    {
      id: 'nodeposit', label: 'Miễn thế chấp',
      active: false, onClick: () => {},
    },
    {
      id: 'discount', label: 'Giảm giá',
      active: false, onClick: () => {},
    },
  ];

  // On mount: fly to default city from URL param or HCM
  useEffect(() => {
    const timer = setTimeout(() => {
      const loc = filters.location || 'hồ chí minh';
      flyTo(loc);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Light Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none z-10 shadow-sm">

        {/* Reset */}
        <button
          onClick={() => setFilters({})}
          title="Thiết lập lại"
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 hover:border-slate-400 flex-shrink-0 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Quick filter pills */}
        {quickPills.map(pill => (
          <button
            key={pill.id}
            onClick={pill.onClick ?? (() => setShowFilters(true))}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all',
              pill.active
                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
            )}
          >
            <span>{pill.label}</span>
            {pill.active && <Check className="w-3 h-3" />}
          </button>
        ))}

        {/* More */}
        <button className="flex-shrink-0 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 hover:border-slate-400 whitespace-nowrap transition-all">
          ···
        </button>

        {/* Divider */}
        <div className="flex-shrink-0 w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Full filter button */}
        <button
          onClick={() => setShowFilters(true)}
          className={cn(
            'flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all',
            showFilters
              ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-600 dark:hover:border-slate-400'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Bộ lọc
        </button>
      </div>

      {/* ── Map Area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-0">

        {/* Floating Search this area button */}
        {showSearchAreaButton && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={handleSearchThisArea}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 font-black text-xs rounded-full shadow-xl transition-all active:scale-95 animate-bounce-short"
            >
              <MapPin className="w-3.5 h-3.5" />
              Search this area / Tìm ở khu vực này
            </button>
          </div>
        )}

        {/* Map Canvas */}
        <LuxeWayMap
          vehicles={vehicles}
          selectedVehicleId={selectedVehicle?.id}
          hoveredVehicleId={hoveredId}
          onVehicleClick={handleVehicleNavigate}
          onMarkerHover={(id) => setHoveredId(id ?? undefined)}
          onBoundsChange={handleBoundsChange}
          height="100%"
        />

        {/* Sort dropdown (top-left, floating) */}
        <div className="absolute top-3 left-3 z-20">
          <div className="relative">
            <button
              onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-white shadow-md hover:shadow-lg transition-all"
            >
              {sortLabel}
              <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', showSort && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  className="absolute top-full mt-1.5 left-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-30"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt)}
                      className={cn(
                        'w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors',
                        opt.label === sortLabel
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Đang tải xe...</span>
          </div>
        )}

        {/* ── Bottom Horizontal Card Carousel ───────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-20">

          {/* Carousel track */}
          <div className="relative flex items-center px-2 py-3 bg-gradient-to-t from-black/20 to-transparent">

            {/* Prev arrow */}
            <button
              onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="absolute left-2 z-30 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Cards */}
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto scroll-smooth px-10 pb-1 scrollbar-none snap-x snap-mandatory"
            >
              {vehicles.length === 0 && !loading ? (
                <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-md">
                  <p className="text-sm font-semibold text-slate-500">Không tìm thấy xe trong khu vực này</p>
                  <button
                    onClick={goToMarketplace}
                    className="mt-3 text-xs text-blue-500 hover:underline font-bold"
                  >
                    Xem tất cả xe →
                  </button>
                </div>
              ) : (
                vehicles.map(v => {
                  const isSel = selectedVehicle?.id === v.id;
                  const thumb = v.thumbnail || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80';
                  const discounted = v.discount > 0;
                  const originalPrice = discounted ? Math.round(v.pricePerDay / (1 - v.discount / 100)) : v.pricePerDay;

                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        handleMarkerClick(v);
                        navigate(`/vehicles/${v.id}`);
                      }}
                      onMouseEnter={() => setHoveredId(v.id)}
                      onMouseLeave={() => setHoveredId(undefined)}
                      className={cn(
                        'flex-shrink-0 w-[290px] sm:w-[310px] bg-white dark:bg-slate-900 rounded-2xl border shadow-lg overflow-hidden snap-start cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5',
                        isSel
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 -translate-y-1 shadow-xl'
                          : hoveredId === v.id
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 -translate-y-0.5 shadow-xl'
                          : 'border-slate-200 dark:border-slate-700'
                      )}
                    >
                      <div className="flex gap-0">
                        {/* Thumbnail */}
                        <div className="relative w-28 h-24 flex-shrink-0">
                          <img src={thumb} alt={v.name} className="w-full h-full object-cover" />
                          {v.instantBook && (
                            <span className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              ⚡
                            </span>
                          )}
                          {discounted && (
                            <span className="absolute bottom-1.5 left-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                              -{v.discount}%
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-black text-[11px] text-slate-800 dark:text-white leading-tight line-clamp-1 uppercase tracking-tight">
                                {v.name}
                              </h4>
                              <button className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0">
                                <Heart className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {Number(v.rating || 4.5).toFixed(1)}
                              </span>
                              <span className="text-[10px] text-slate-400">·</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {v.totalTrips || 0} chuyến
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                              <p className="text-[9px] text-slate-400 truncate">{v.address || v.city}</p>
                            </div>
                          </div>

                          <div className="mt-1.5">
                            {discounted && (
                              <span className="text-[9px] text-slate-400 line-through mr-1">
                                {formatCurrency(originalPrice)}
                              </span>
                            )}
                            <span className={cn('font-black text-xs', discounted ? 'text-[#D4AF37]' : 'text-slate-800 dark:text-white')}>
                              {formatCurrency(v.pricePerDay)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">/ngày</span>

                            {/* Specs row */}
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500 font-medium">
                              {v.transmission && <span>🔧 {v.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn'}</span>}
                              {v.seats && <span>👥 {v.seats} chỗ</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Next arrow */}
            <button
              onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="absolute right-2 z-30 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* "Xem xe trong khu vực này" gold pill button */}
          <div className="flex justify-center pb-4">
            <button
              onClick={() => fetchVehicles()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 font-black text-xs rounded-full shadow-lg transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5" />
              Xem xe trong khu vực này
            </button>
          </div>
        </div>

        {/* Close sort dropdown when clicking outside */}
        {showSort && (
          <div className="absolute inset-0 z-10" onClick={() => setShowSort(false)} />
        )}
      </div>

      {/* ── Filter Drawer + Backdrop ─────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <MapFilterDrawer
              filters={filters}
              onChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;
