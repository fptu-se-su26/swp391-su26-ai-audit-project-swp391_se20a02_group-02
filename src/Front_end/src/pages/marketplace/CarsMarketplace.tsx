import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown,
  MapPin, Sparkles, ArrowUpDown, Shield, Car, Bike,
  Map, ZoomIn, ZoomOut, Compass, Zap, Star, Check,
  UserCircle, Briefcase, Plane, Heart, Package
} from 'lucide-react';
import { carService } from '@/services/carService';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import type { Vehicle, VehicleFilters, VehicleCategory, VehicleType } from '@/types';
import { formatCurrency, debounce, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { useT } from '@/i18n/translations';

// ====== VND PRICE FORMATTER ======
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ====== CAR CATEGORIES ======
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
];

const CAR_BRANDS = ['Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Ford', 'Mitsubishi', 'VinFast', 'Mercedes-Benz', 'BMW', 'Audi', 'Porsche'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'newest', label: 'Mới nhất' },
];

// ====== MAP SIMULATOR ======
const MapSimulator: React.FC<{
  vehicles: Vehicle[];
  hoveredVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}> = ({ vehicles, hoveredVehicleId, onSelectVehicle }) => {
  const [zoom, setZoom] = useState(13);
  const [selectedPin, setSelectedPin] = useState<Vehicle | null>(null);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (selectedPin && !vehicles.some(v => v.id === selectedPin.id)) {
      setSelectedPin(null);
    }
  }, [vehicles, selectedPin]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - centerOffset.x, y: e.clientY - centerOffset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCenterOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-full h-full relative bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      <div
        onMouseDown={handleMouseDown}
        className="absolute w-[3000px] h-[3000px] transition-transform duration-200"
        style={{
          transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 2px, transparent 2px)',
          backgroundSize: '30px 30px, 90px 90px',
        }}
      >
        {/* Mock City Paths / Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[1400px] left-0 right-0 h-10 bg-blue-500/10 blur-sm transform -rotate-12" />
          <div className="absolute top-0 bottom-0 left-[1400px] w-10 bg-blue-500/10 blur-sm transform rotate-45" />
        </div>

        {/* Vehicle Pins */}
        {vehicles.map((v, i) => {
          const latOffset = (v.location.lat - 10.7) * 30000;
          const lngOffset = (v.location.lng - 106.6) * 30000;
          const left = 1500 + lngOffset;
          const top = 1500 - latOffset;

          const isHovered = hoveredVehicleId === v.id;
          const isSelected = selectedPin?.id === v.id;

          return (
            <div
              key={v.id}
              className="absolute transition-all duration-300 z-10"
              style={{ left: `${left}px`, top: `${top}px` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(v);
                  onSelectVehicle(v.id);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-black text-white shadow-xl flex items-center gap-1 border transition-all duration-200 hover:scale-110",
                  isSelected
                    ? "bg-blue-600 border-white scale-110 z-30"
                    : isHovered
                      ? "bg-blue-500 border-blue-400 scale-105 z-20"
                      : "bg-[#0b101c]/90 border-slate-750 backdrop-blur-md"
                )}
              >
                <span>🚗</span>
                <span>{formatCurrency(v.pricePerDay)}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Info Overlays */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-6 left-6 right-6 glass dark:glass-dark p-4 rounded-3xl border border-white/10 shadow-2xl z-40 flex gap-4 items-center"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0">
              <img src={selectedPin.thumbnailUrl} alt={selectedPin.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-xs font-bold truncate">{selectedPin.name}</h4>
              <p className="text-blue-400 text-xs font-extrabold mt-1">{formatCurrency(selectedPin.pricePerDay)}/ngày</p>
              <p className="text-slate-400 text-[10px] truncate mt-0.5">📍 {selectedPin.location.address}</p>
            </div>
            <Link
              to={`/cars/${selectedPin.id}`}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
            >
              Detail
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-1.5">
        <button onClick={() => setZoom(z => Math.min(18, z + 1))} className="w-9 h-9 rounded-xl glass hover:bg-white/20 text-white flex items-center justify-center font-bold">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(z => Math.max(10, z - 1))} className="w-9 h-9 rounded-xl glass hover:bg-white/20 text-white flex items-center justify-center font-bold">
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b101c]/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-300">
        <Compass className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
        <span>LuxeWay Map</span>
      </div>
    </div>
  );
};

// ====== CAR FILTER PANEL ======
const CarFilterPanel: React.FC<{ filters: VehicleFilters; onChange: (f: VehicleFilters) => void; onClose?: () => void }> = ({ filters, onChange, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice ?? 0, filters.maxPrice ?? 5000000]);

  const toggle = (key: keyof VehicleFilters, val: any) => {
    const arr: any[] = (filters as any)[key] || [];
    const next = arr.includes(val) ? arr.filter((x: any) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next.length > 0 ? next : undefined });
  };

  const toggleBool = (key: keyof VehicleFilters) =>
    onChange({ ...filters, [key]: !(filters as any)[key] || undefined });

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 pb-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-550" /> Lọc Xe Ô Tô
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onChange({ vehicleType: 'car' })} className="text-xs text-blue-500 hover:underline font-bold">Xóa lọc</button>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Car categories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dòng Xe</p>
        <div className="grid grid-cols-2 gap-2">
          {CAR_CATEGORIES.map(cat => {
            const sel = (filters.category || []).includes(cat.value);
            return (
              <button key={cat.value} onClick={() => toggle('category', cat.value)}
                className={cn("px-2 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                <span>{cat.icon}</span>{cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range for cars */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Giá / Ngày</p>
          <span className="text-xs font-bold text-foreground">{formatVND(priceRange[0])} – {formatVND(priceRange[1])}</span>
        </div>
        <input type="range" min={0} max={5000000} step={50000} value={priceRange[0]}
          onChange={e => { const v = Math.min(Number(e.target.value), priceRange[1] - 100000); setPriceRange([v, priceRange[1]]); onChange({ ...filters, minPrice: v > 0 ? v : undefined }); }}
          className="w-full accent-blue-550 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2" />
        <input type="range" min={0} max={5000000} step={50000} value={priceRange[1]}
          onChange={e => { const v = Math.max(Number(e.target.value), priceRange[0] + 100000); setPriceRange([priceRange[0], v]); onChange({ ...filters, maxPrice: v < 5000000 ? v : undefined }); }}
          className="w-full accent-blue-550 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>500k</span><span>2.5tr</span><span>5.0tr</span>
        </div>
      </div>

      {/* Seats */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Số Chỗ Ngồi</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '4 chỗ', val: 4 },
            { label: '5 chỗ', val: 5 },
            { label: '7 chỗ', val: 7 },
            { label: '9+ chỗ', val: 9 }
          ].map(seat => {
            const sel = filters.minSeats === seat.val;
            return (
              <button key={seat.label} onClick={() => onChange({ ...filters, minSeats: sel ? undefined : seat.val })}
                className={cn("py-2 rounded-xl text-xs font-bold border transition-all",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hộp Số</p>
        <div className="flex gap-2">
          {(['automatic', 'manual'] as const).map(t => {
            const sel = (filters.transmission || []).includes(t);
            return (
              <button key={t} onClick={() => { onChange({ ...filters, transmission: sel ? undefined : [t] }); }}
                className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {t === 'automatic' ? 'Tự Động' : 'Số Sàn'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Loại Nhiên Liệu</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'gasoline', label: 'Xăng' },
            { value: 'diesel', label: 'Dầu Diesel' },
            { value: 'electric', label: 'Điện' },
            { value: 'hybrid', label: 'Hybrid' }
          ].map(fuel => {
            const sel = (filters.fuelType || []).includes(fuel.value as any);
            return (
              <button key={fuel.value} onClick={() => { onChange({ ...filters, fuelType: sel ? undefined : [fuel.value as any] }); }}
                className={cn("py-2 rounded-xl text-xs font-bold border transition-all",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hãng Xe</p>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {CAR_BRANDS.map(brand => {
            const checked = (filters.brands || []).includes(brand);
            return (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={checked} onChange={() => toggle('brands', brand)} className="rounded text-blue-500 accent-blue-500 w-4 h-4" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-foreground transition-colors">{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Special Options */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tính Năng & Dịch Vụ</p>
        <div className="space-y-2">
          {[
            { key: 'hasChauffeur', icon: <UserCircle className="w-3.5 h-3.5" />, label: 'Có Tài Xế Riêng' },
            { key: 'airportDelivery', icon: <Plane className="w-3.5 h-3.5" />, label: 'Giao Xe Sân Bay' },
            { key: 'weddingRental', icon: <Heart className="w-3.5 h-3.5" />, label: 'Phục Vụ Đám Cưới' },
            { key: 'businessRental', icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Xe Doanh Nghiệp' },
            { key: 'instantBook', icon: <Zap className="w-3.5 h-3.5" />, label: 'Đặt Ngay' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={!!(filters as any)[f.key]} onChange={() => toggleBool(f.key as keyof VehicleFilters)} className="rounded text-blue-500 accent-blue-500 w-4 h-4" />
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-foreground transition-colors">
                <span className="text-blue-400">{f.icon}</span>{f.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Đánh Giá Tối Thiểu</p>
        <div className="flex gap-2">
          {[4.0, 4.5, 4.8].map(r => (
            <button key={r} onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? undefined : r })}
              className={cn("flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                filters.minRating === r ? "border-blue-500 bg-blue-500/10 text-blue-650 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MAIN PAGE COMPONENT ======
export const CarsMarketplace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mapOpen, setMapOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Search and state
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Initialize filters from query params
  const [filters, setFilters] = useState<VehicleFilters>(() => {
    const p: VehicleFilters = { vehicleType: 'car' };
    const loc = searchParams.get('location');
    if (loc) p.location = loc;
    const cat = searchParams.get('category');
    if (cat) p.category = [cat as VehicleCategory];
    const brand = searchParams.get('brand');
    if (brand) p.brands = [brand];
    return p;
  });

  const loadVehicles = async (currentFilters: VehicleFilters, currentPage: number) => {
    setLoading(true);
    const res = await carService.getAll(currentFilters, currentPage, 12);
    setVehicles(res.data);
    setTotal(res.meta?.total || 0);
    setTotalPages(res.meta?.totalPages || 1);
    setLoading(false);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      loadVehicles({ ...filters, location: query || undefined }, 1);
    }, 400),
    [filters]
  );

  useEffect(() => {
    if (searchQuery) debouncedSearch(searchQuery);
    else loadVehicles(filters, page);
  }, [filters, page, searchQuery]);

  const handleFilterChange = (newFilters: VehicleFilters) => {
    setFilters({ ...newFilters, vehicleType: 'car' });
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (val === undefined || val === '' || key === 'sortBy' || key === 'vehicleType') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* ====== ECOSYSTEM SWITCHER HEADER ====== */}
      <div className="bg-card border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border-2 border-blue-500 bg-blue-500/10 text-blue-650 dark:text-blue-400 shadow-sm whitespace-nowrap flex-shrink-0"
            >
              <Car className="w-4 h-4" />
              <span>Hệ Ô Tô (Cars Context)</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600">
                {loading ? '...' : total}
              </span>
            </button>

            <Link
              to="/motorbikes"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border-2 border-transparent text-slate-500 hover:text-orange-500 hover:bg-orange-500/5 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Bike className="w-4 h-4" />
              <span>Chuyển Sang Xe Máy 🏍️</span>
            </Link>

            <div className="flex-1" />

            {/* Quick City Filters */}
            <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
              {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt'].map(city => (
                <button
                  key={city}
                  onClick={() => handleFilterChange({ ...filters, location: filters.location === city ? undefined : city })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap",
                    filters.location === city
                      ? "border-blue-550 bg-blue-500/10 text-blue-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350"
                  )}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />{city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====== SEARCH HEADER BAR ====== */}
      <div className="bg-card border-b border-slate-100 dark:border-slate-800 sticky top-20 z-40 shadow-sm border-l-4 border-l-blue-500/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🚗 Tìm xe ô tô... Camry, Mazda 3, Ford Ranger, VinFast VF8..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none text-foreground focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-205",
                showFilters ? "border-blue-500 bg-blue-500/10 text-blue-600" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Lọc</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center bg-blue-500">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="relative">
              <select
                value={filters.sortBy || 'popular'}
                onChange={e => handleFilterChange({ ...filters, sortBy: e.target.value as VehicleFilters['sortBy'] })}
                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 border border-slate-200/40 dark:border-slate-800/40">
              {(['grid', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={cn("p-2 rounded-xl transition-all", viewMode === mode ? "bg-white dark:bg-slate-800 shadow-sm text-foreground font-bold" : "text-slate-450 hover:text-foreground")}>
                  {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMapOpen(!mapOpen)}
              className={cn("hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all",
                mapOpen ? "bg-blue-500/10 border-blue-500 text-blue-655" : "border-slate-200 dark:border-slate-800 text-slate-500")}>
              <Map className="w-4 h-4" />
              <span>Bản Đồ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden xl:block flex-shrink-0 overflow-hidden"
              >
                <div className="w-[300px] bg-card rounded-3xl border border-slate-150 dark:border-slate-800 p-6 sticky top-38 shadow-sm">
                  <CarFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Catalog */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-slate-450">
                  {loading ? 'Đang tải...' : (
                    <>Tìm thấy <span className="font-extrabold text-foreground">{total}</span> xe ô tô</>
                  )}
                </p>
                {filters.location && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5" />
                    {filters.location}
                    <button onClick={() => handleFilterChange({ ...filters, location: undefined })} className="ml-1 p-0.5 rounded-full hover:bg-blue-500/20">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-500 text-blue-650 bg-blue-500/10">
                <Car className="w-3.5 h-3.5" />
                Ô Tô
              </div>
            </div>

            {/* Vehicle Grid */}
            {loading ? (
              <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6')}>
                {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
              </div>
            ) : vehicles.length === 0 ? (
              <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="text-center py-24 bg-card border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="text-7xl mb-4">🚗</div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Không tìm thấy ô tô phù hợp</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                <button onClick={() => { setFilters({ vehicleType: 'car' }); setSearchQuery(''); }}
                  className="btn-primary px-6 py-2.5" style={{ backgroundColor: '#3b82f6' }}>Xóa Bộ Lọc</button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={staggerContainer} initial="hidden" animate="visible"
                  className={cn(viewMode === 'grid'
                    ? mapOpen ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
                    : 'space-y-6'
                  )}
                >
                  {vehicles.map(vehicle => (
                    <motion.div
                      key={vehicle.id} variants={staggerItem}
                      id={`vehicle-card-${vehicle.id}`}
                      onMouseEnter={() => setHoveredVehicleId(vehicle.id)}
                      onMouseLeave={() => setHoveredVehicleId(null)}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={cn("transition-all duration-300 rounded-3xl cursor-pointer",
                        hoveredVehicleId === vehicle.id ? "ring-2 ring-blue-500" : "",
                        selectedVehicleId === vehicle.id ? "ring-2 ring-blue-500 bg-blue-500/5 dark:bg-blue-500/10" : ""
                      )}
                    >
                      <VehicleCard vehicle={vehicle} variant={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      ← Trước
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={cn("w-10 h-10 rounded-2xl text-sm font-bold border transition-all",
                            pageNum === page ? "border-blue-500 bg-blue-500 text-white shadow-lg" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900")}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map Panel */}
          <AnimatePresence>
            {mapOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '420px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block flex-shrink-0 sticky top-52 overflow-hidden"
                style={{ height: 'calc(100vh - 220px)' }}
              >
                <MapSimulator vehicles={vehicles} hoveredVehicleId={hoveredVehicleId} onSelectVehicle={id => {
                  setSelectedVehicleId(id);
                  document.getElementById(`vehicle-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CarsMarketplace;
