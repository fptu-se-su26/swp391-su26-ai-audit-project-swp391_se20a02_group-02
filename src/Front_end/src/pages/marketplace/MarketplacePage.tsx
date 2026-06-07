import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown,
  MapPin, Sparkles, ArrowUpDown, Shield, Car, Bike,
  Map, ZoomIn, ZoomOut, Compass, Zap, Star, Check,
  Smartphone, CloudRain, Package, UserCircle,
  Plane, Heart, Briefcase
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import type { Vehicle, VehicleFilters, VehicleCategory, VehicleType } from '@/types';
import { formatCurrency, debounce, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { useT } from '@/i18n/translations';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
const FALLBACK_MOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800';

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
  { value: 'electric_car', label: 'Electric', icon: '⚡' },
  { value: 'sports', label: 'Sports', icon: '🏎️' },
  { value: 'pickup', label: 'Pickup', icon: '🛻' },
];

// ====== MOTORBIKE CATEGORIES ======
const MOTORBIKE_CATEGORIES: { value: VehicleCategory; label: string; icon: string }[] = [
  { value: 'scooter', label: 'Scooter', icon: '🛵' },
  { value: 'automatic_scooter', label: 'Auto Scooter', icon: '🛵' },
  { value: 'manual_motorcycle', label: 'Manual', icon: '🏍️' },
  { value: 'sport_bike', label: 'Sport Bike', icon: '🏍️' },
  { value: 'touring_bike', label: 'Touring', icon: '🏕️' },
  { value: 'adventure_bike', label: 'Adventure', icon: '🌄' },
  { value: 'classic_bike', label: 'Classic', icon: '🏛️' },
  { value: 'electric_bike', label: 'Electric', icon: '⚡' },
];

// ====== CAR BRANDS ======
const CAR_BRANDS = ['Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Ford', 'Mitsubishi', 'VinFast', 'Mercedes-Benz', 'BMW', 'Audi', 'Porsche'];

// ====== MOTORBIKE BRANDS ======
const MOTO_BRANDS = ['Honda', 'Yamaha', 'Suzuki', 'VinFast', 'Kawasaki', 'Piaggio', 'Vespa', 'SYM'];

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
      className="relative w-full h-full bg-[#1e293b] overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${centerOffset.x}px, ${centerOffset.y}px) scale(${zoom / 13})`,
          backgroundImage: 'radial-gradient(circle, #334155 1.5px, transparent 1.5px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '30px 30px, 90px 90px, 90px 90px',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute top-[20%] left-[30%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">Quận 1 (Trung tâm)</div>
        <div className="absolute top-[45%] left-[60%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">Quận 2 (Thảo Điền)</div>
        <div className="absolute top-[70%] left-[20%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">Quận 7 (Phú Mỹ Hưng)</div>
        <div className="absolute top-[10%] left-[75%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">Bình Thạnh</div>

        <svg className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 opacity-20 pointer-events-none" stroke="#475569" strokeWidth="2" fill="none">
          <path d="M 0 300 Q 400 350 800 500 T 1600 600" />
          <path d="M 300 0 Q 450 500 600 1200" />
          <path d="M 100 800 C 500 700 900 900 1500 800" strokeWidth="4" stroke="#64748b" />
        </svg>
        <svg className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 opacity-30 pointer-events-none" stroke="#1e3a8a" strokeWidth="40" fill="none" strokeLinecap="round">
          <path d="M 200 0 Q 300 400 700 450 T 1100 800 T 1600 1200" />
        </svg>

        {vehicles.map((v, index) => {
          const latOffset = v.location?.lat ? (v.location.lat - 10.762) * 500 : (Math.sin(index * 45) * 150);
          const lngOffset = v.location?.lng ? (v.location.lng - 106.66) * 500 : (Math.cos(index * 45) * 150);
          const isHovered = hoveredVehicleId === v.id;
          const isSelected = selectedPin?.id === v.id;
          return (
            <div
              key={v.id}
              onClick={e => { e.stopPropagation(); setSelectedPin(v); onSelectVehicle(v.id); }}
              className="absolute cursor-pointer transition-all duration-200"
              style={{
                top: `calc(50% + ${latOffset}px)`,
                left: `calc(50% + ${lngOffset}px)`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 50 : isHovered ? 40 : 20
              }}
            >
              <div className={cn(
                "px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border flex items-center gap-1",
                isSelected ? "bg-accent border-accent text-white scale-110"
                  : isHovered ? "bg-slate-100 border-accent text-accent dark:bg-slate-900 scale-105"
                    : "bg-slate-900/90 border-slate-700/80 text-white dark:bg-slate-900/90 hover:scale-105"
              )}>
                {v.vehicleType === 'motorbike' ? '🏍' : '🚗'}
                {formatVND(v.pricePerDay)}
              </div>
              <div className={cn("w-2 h-2 rounded-full mx-auto mt-1 border border-white shadow", isSelected || isHovered ? "bg-accent" : "bg-slate-500")} />
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
        <button onClick={() => setZoom(z => Math.min(z + 1, 16))} className="w-10 h-10 bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center rounded-xl shadow-lg backdrop-blur hover:bg-slate-800"><ZoomIn className="w-5 h-5" /></button>
        <button onClick={() => setZoom(z => Math.max(z - 1, 10))} className="w-10 h-10 bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center rounded-xl shadow-lg backdrop-blur hover:bg-slate-800"><ZoomOut className="w-5 h-5" /></button>
        <button onClick={() => { setCenterOffset({ x: 0, y: 0 }); setZoom(13); setSelectedPin(null); }} className="w-10 h-10 bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center rounded-xl shadow-lg backdrop-blur hover:bg-slate-800"><Compass className="w-5 h-5" /></button>
      </div>

      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-slate-900/95 border border-slate-800/80 backdrop-blur rounded-3xl p-4 shadow-2xl z-40"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedPin(null)} className="absolute top-3 right-3 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-4">
              <img src={selectedPin.images?.[0] || selectedPin.thumbnailUrl || (selectedPin.vehicleType === 'motorbike' ? FALLBACK_MOTO : FALLBACK_IMAGE)} alt={selectedPin.name} className="w-24 h-20 object-cover rounded-2xl bg-slate-800" />
              <div className="flex-1 min-w-0 pr-4">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{selectedPin.brand}</span>
                <h4 className="font-bold text-white text-sm leading-tight truncate mt-0.5">{selectedPin.name}</h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-white text-xs">{selectedPin.rating || '5.0'}</span>
                  <span className="text-slate-400 text-[10px]">({selectedPin.totalReviews || 0})</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-white">{formatVND(selectedPin.pricePerDay)}/ngày</span>
                  <Link to={`/vehicles/${selectedPin.id}`} className="text-[10px] font-bold bg-accent text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">Xem</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700/60 backdrop-blur text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 pointer-events-none">
        <Map className="w-3.5 h-3.5 text-accent" />
        <span>LuxeWay Map</span>
      </div>
    </div>
  );
};

// ====== CAR FILTER PANEL ======
const CarFilterPanel: React.FC<{ filters: VehicleFilters; onChange: (f: VehicleFilters) => void; onClose?: () => void }> = ({ filters, onChange, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice ?? 0, filters.maxPrice ?? 15000000]);

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
          <Car className="w-4 h-4 text-blue-500" /> Lọc Xe Ô Tô
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onChange({ vehicleType: 'car' })} className="text-xs text-accent hover:underline font-bold">Xóa lọc</button>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Loại Xe</p>
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

      {/* Price */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Giá / Ngày</p>
          <span className="text-xs font-bold text-foreground">{formatVND(priceRange[0])} – {formatVND(priceRange[1])}</span>
        </div>
        <input type="range" min={0} max={15000000} step={100000} value={priceRange[0]}
          onChange={e => { const v = Math.min(Number(e.target.value), priceRange[1] - 500000); setPriceRange([v, priceRange[1]]); onChange({ ...filters, minPrice: v > 0 ? v : undefined }); }}
          className="w-full accent-blue-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2" />
        <input type="range" min={0} max={15000000} step={100000} value={priceRange[1]}
          onChange={e => { const v = Math.max(Number(e.target.value), priceRange[0] + 500000); setPriceRange([priceRange[0], v]); onChange({ ...filters, maxPrice: v < 15000000 ? v : undefined }); }}
          className="w-full accent-blue-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
      </div>

      {/* Seats */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Số Ghế</p>
        <div className="flex gap-2">
          {[4, 5, 7, 9].map(s => (
            <button key={s} onClick={() => onChange({ ...filters, minSeats: filters.minSeats === s ? undefined : s })}
              className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                filters.minSeats === s ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
              {s} chỗ
            </button>
          ))}
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

      {/* Fuel */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Nhiên Liệu</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'gasoline', l: '⛽ Xăng' }, { v: 'diesel', l: '🛢️ Dầu' }, { v: 'hybrid', l: '🌿 Hybrid' }, { v: 'electric', l: '⚡ Điện' }].map(f => {
            const sel = (filters.fuelType || []).includes(f.v as any);
            return (
              <button key={f.v} onClick={() => { onChange({ ...filters, fuelType: sel ? undefined : [f.v as any] }); }}
                className={cn("py-2 rounded-xl text-xs font-bold border transition-all",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {f.l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Thương Hiệu</p>
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

      {/* Car-specific services */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dịch Vụ Đặc Biệt</p>
        <div className="space-y-2">
          {[
            { key: 'hasChauffeur', icon: <UserCircle className="w-3.5 h-3.5" />, label: 'Có Tài Xế Riêng' },
            { key: 'airportDelivery', icon: <Plane className="w-3.5 h-3.5" />, label: 'Giao Xe Sân Bay' },
            { key: 'weddingRental', icon: <Heart className="w-3.5 h-3.5" />, label: 'Xe Đám Cưới' },
            { key: 'businessRental', icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Xe Doanh Nghiệp' },
            { key: 'deliveryAvailable', icon: <MapPin className="w-3.5 h-3.5" />, label: 'Giao Xe Tận Nơi' },
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
                filters.minRating === r ? "border-amber-400 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MOTORBIKE FILTER PANEL ======
const MotorbikeFilterPanel: React.FC<{ filters: VehicleFilters; onChange: (f: VehicleFilters) => void; onClose?: () => void }> = ({ filters, onChange, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice ?? 0, filters.maxPrice ?? 1500000]);

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
          <Bike className="w-4 h-4 text-orange-500" /> Lọc Xe Máy
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onChange({ vehicleType: 'motorbike' })} className="text-xs text-orange-500 hover:underline font-bold">Xóa lọc</button>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Motorbike categories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Loại Xe Máy</p>
        <div className="grid grid-cols-2 gap-2">
          {MOTORBIKE_CATEGORIES.map(cat => {
            const sel = (filters.category || []).includes(cat.value);
            return (
              <button key={cat.value} onClick={() => toggle('category', cat.value)}
                className={cn("px-2 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5",
                  sel ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                <span>{cat.icon}</span>{cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range for motorbikes */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Giá / Ngày</p>
          <span className="text-xs font-bold text-foreground">{formatVND(priceRange[0])} – {formatVND(priceRange[1])}</span>
        </div>
        <input type="range" min={0} max={1500000} step={10000} value={priceRange[0]}
          onChange={e => { const v = Math.min(Number(e.target.value), priceRange[1] - 50000); setPriceRange([v, priceRange[1]]); onChange({ ...filters, minPrice: v > 0 ? v : undefined }); }}
          className="w-full accent-orange-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2" />
        <input type="range" min={0} max={1500000} step={10000} value={priceRange[1]}
          onChange={e => { const v = Math.max(Number(e.target.value), priceRange[0] + 50000); setPriceRange([priceRange[0], v]); onChange({ ...filters, maxPrice: v < 1500000 ? v : undefined }); }}
          className="w-full accent-orange-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>120k</span><span>500k</span><span>1.5tr</span>
        </div>
      </div>

      {/* Engine CC */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dung Tích Máy (CC)</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '50cc', min: 50, max: 110 },
            { label: '110cc', min: 110, max: 125 },
            { label: '125cc', min: 125, max: 150 },
            { label: '150cc', min: 150, max: 175 },
            { label: '175cc', min: 175, max: 300 },
            { label: '300cc+', min: 300, max: 9999 },
          ].map(cc => {
            const sel = filters.minEngineCc === cc.min;
            return (
              <button key={cc.label} onClick={() => onChange({ ...filters, minEngineCc: sel ? undefined : cc.min, maxEngineCc: sel ? undefined : cc.max })}
                className={cn("py-2 rounded-xl text-xs font-bold border transition-all",
                  sel ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {cc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hộp Số</p>
        <div className="flex gap-2">
          {[{ v: 'automatic', l: '🔄 Tự Động' }, { v: 'manual', l: '⚙️ Số Côn' }].map(t => {
            const sel = (filters.transmission || []).includes(t.v as any);
            return (
              <button key={t.v} onClick={() => onChange({ ...filters, transmission: sel ? undefined : [t.v as any] })}
                className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  sel ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {t.l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Nhiên Liệu</p>
        <div className="flex gap-2">
          {[{ v: 'gasoline', l: '⛽ Xăng' }, { v: 'electric', l: '⚡ Điện' }].map(f => {
            const sel = (filters.fuelType || []).includes(f.v as any);
            return (
              <button key={f.v} onClick={() => onChange({ ...filters, fuelType: sel ? undefined : [f.v as any] })}
                className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  sel ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {f.l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Thương Hiệu</p>
        <div className="flex flex-wrap gap-2">
          {MOTO_BRANDS.map(brand => {
            const sel = (filters.brands || []).includes(brand);
            return (
              <button key={brand} onClick={() => toggle('brands', brand)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                  sel ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Motorbike accessories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Trang Bị Kèm</p>
        <div className="space-y-2">
          {[
            { key: 'hasHelmet', icon: '🪖', label: 'Mũ Bảo Hiểm' },
            { key: 'hasPhoneHolder', icon: '📱', label: 'Giá Đỡ Điện Thoại' },
            { key: 'hasRaincoat', icon: '🌧️', label: 'Áo Mưa' },
            { key: 'hasTouringPackage', icon: '🧳', label: 'Gói Touring' },
            { key: 'instantBook', icon: '⚡', label: 'Đặt Ngay' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={!!(filters as any)[f.key]} onChange={() => toggleBool(f.key as keyof VehicleFilters)} className="rounded text-orange-500 accent-orange-500 w-4 h-4" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-foreground transition-colors">
                {f.icon} {f.label}
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
                filters.minRating === r ? "border-amber-400 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MAIN MARKETPLACE PAGE ======
const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [mapOpen, setMapOpen] = useState(true);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [totalPages, setTotalPages] = useState(1);

  // Active vehicle type tab
  const [activeType, setActiveType] = useState<VehicleType | 'all'>(
    (searchParams.get('type') as VehicleType) || 'all'
  );

  const [filters, setFilters] = useState<VehicleFilters>(() => {
    const type = searchParams.get('type') as VehicleType | undefined;
    return {
      vehicleType: type || undefined,
      location: searchParams.get('location') || undefined,
      sortBy: (searchParams.get('sort') as VehicleFilters['sortBy']) || 'popular',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };
  });

  const loadVehicles = useCallback(async (f: VehicleFilters, p: number) => {
    setLoading(true);
    const result = await vehicleService.getAll(f, p, 12);
    setVehicles(result.data);
    setTotal(result.meta?.total || 0);
    setTotalPages(result.meta?.totalPages || 1);
    setLoading(false);
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (q.trim()) {
        setLoading(true);
        const results = await vehicleService.search(q);
        
        // Client-side filter to respect active ecosystem tab
        const filteredResults = filters.vehicleType
          ? results.filter(v => v.vehicleType?.toLowerCase() === filters.vehicleType?.toLowerCase())
          : results;

        setVehicles(filteredResults);
        setTotal(filteredResults.length);
        setTotalPages(1);
        setLoading(false);
      } else {
        loadVehicles(filters, page);
      }
    }, 400),
    [filters, page, loadVehicles]
  );

  useEffect(() => {
    if (searchQuery) debouncedSearch(searchQuery);
    else loadVehicles(filters, page);
  }, [filters, page, searchQuery]);

  const handleTypeSwitch = (type: VehicleType | 'all') => {
    setActiveType(type);
    setPage(1);
    setFilters({ vehicleType: type === 'all' ? undefined : type, sortBy: filters.sortBy });
  };

  const handleFilterChange = (newFilters: VehicleFilters) => {
    setFilters({ ...newFilters, vehicleType: activeType === 'all' ? undefined : activeType });
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (val === undefined || val === '' || key === 'sortBy' || key === 'vehicleType') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  // Type colors
  const typeColor = activeType === 'motorbike' ? 'orange' : activeType === 'car' ? 'blue' : 'accent';
  const accentClass = activeType === 'motorbike' ? 'text-orange-500 border-orange-500 bg-orange-500/10'
    : activeType === 'car' ? 'text-blue-500 border-blue-500 bg-blue-500/10'
      : 'text-accent border-accent bg-accent/10';

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* ====== VEHICLE TYPE TABS ====== */}
      <div className="bg-card border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {[
              { type: 'all' as const, label: 'Tất Cả Xe', icon: <Sparkles className="w-4 h-4" />, count: null },
              { type: 'car' as const, label: 'Ô Tô', icon: <Car className="w-4 h-4" />, count: null },
              { type: 'motorbike' as const, label: 'Xe Máy', icon: <Bike className="w-4 h-4" />, count: null },
            ].map(tab => (
              <button
                key={tab.type}
                onClick={() => handleTypeSwitch(tab.type)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all whitespace-nowrap flex-shrink-0",
                  activeType === tab.type
                    ? tab.type === 'motorbike'
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm"
                      : tab.type === 'car'
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-accent bg-accent/10 text-accent shadow-sm"
                    : "border-transparent text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
              >
                {tab.icon}
                {tab.label}
                {activeType === tab.type && (
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                    tab.type === 'motorbike' ? "bg-orange-500/20 text-orange-600"
                      : tab.type === 'car' ? "bg-blue-500/20 text-blue-600"
                        : "bg-accent/20 text-accent"
                  )}>
                    {loading ? '...' : total}
                  </span>
                )}
              </button>
            ))}

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
                      ? "border-accent bg-accent/10 text-accent"
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
      <div className={cn(
        "bg-card border-b border-slate-100 dark:border-slate-800 sticky top-20 z-40 shadow-sm",
        activeType === 'motorbike' ? "border-l-4 border-l-orange-500/40" : activeType === 'car' ? "border-l-4 border-l-blue-500/40" : ""
      )}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={activeType === 'motorbike' ? '🏍️ Tìm xe máy... Vision, Exciter, SH...' : activeType === 'car' ? '🚗 Tìm ô tô... Vios, Camry, CX5...' : '🔍 Tìm xe... Honda, Toyota, VinFast...'}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none text-foreground focus:border-accent focus:bg-white dark:focus:bg-slate-950 transition-all font-semibold"
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
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-200",
                showFilters
                  ? activeType === 'motorbike' ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-blue-500 bg-blue-500/10 text-blue-600"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Lọc</span>
              {activeFilterCount > 0 && (
                <span className={cn("w-5 h-5 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center",
                  activeType === 'motorbike' ? "bg-orange-500" : "bg-blue-500")}>
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
                mapOpen ? "bg-accent/15 border-accent text-accent" : "border-slate-200 dark:border-slate-800 text-slate-500")}>
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
                  {activeType === 'motorbike' ? (
                    <MotorbikeFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                  ) : (
                    <CarFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Catalog */}
          <div className="flex-1 min-w-0">
            {/* Result count + active filters */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-slate-450">
                  {loading ? 'Đang tải...' : (
                    <>Tìm thấy <span className="font-extrabold text-foreground">{total}</span>
                      {' '}{activeType === 'motorbike' ? 'xe máy' : activeType === 'car' ? 'ô tô' : 'xe'}
                    </>
                  )}
                </p>
                {filters.location && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5" />
                    {filters.location}
                    <button onClick={() => handleFilterChange({ ...filters, location: undefined })} className="ml-1 p-0.5 rounded-full hover:bg-accent/20">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Active type badge */}
              {activeType !== 'all' && (
                <div className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border", accentClass)}>
                  {activeType === 'motorbike' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                  {activeType === 'motorbike' ? 'Xe Máy' : 'Ô Tô'}
                </div>
              )}
            </div>

            {/* Vehicle Grid */}
            {loading ? (
              <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6')}>
                {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
              </div>
            ) : vehicles.length === 0 ? (
              <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="text-center py-24 bg-card border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="text-7xl mb-4">{activeType === 'motorbike' ? '🏍️' : '🚗'}</div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Không tìm thấy xe phù hợp</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                <button onClick={() => { setFilters({ vehicleType: activeType === 'all' ? undefined : activeType }); setSearchQuery(''); }}
                  className="btn-primary px-6 py-2.5">Xóa Bộ Lọc</button>
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
                        hoveredVehicleId === vehicle.id ? "ring-2 ring-accent" : "",
                        selectedVehicleId === vehicle.id ? "ring-2 ring-accent bg-accent/5 dark:bg-accent/10" : ""
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
                            pageNum === page ? "border-accent bg-accent text-white shadow-lg" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900")}>
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

export default MarketplacePage;
