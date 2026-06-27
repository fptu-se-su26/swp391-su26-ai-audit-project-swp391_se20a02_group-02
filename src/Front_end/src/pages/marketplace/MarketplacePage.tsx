import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { LuxeWayMap } from '@/components/map/LuxeWayMap';
import { useUIStore } from '@/store';
import type { Vehicle, VehicleFilters, VehicleCategory, VehicleType, VehicleLocationResponse } from '@/types';
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
  { value: 'nearest', label: 'Gần tôi nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'newest', label: 'Mới nhất' },
];

// ====== COMPACT SIDEBAR CARD FOR MAP VIEW ======
interface CompactSidebarCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  hovered: boolean;
  locationText: string;
}

const CompactSidebarCard: React.FC<CompactSidebarCardProps> = ({
  vehicle,
  isSelected,
  hovered,
  locationText
}) => {
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
  const thumbnailSrc = vehicle.images?.[0] || vehicle.thumbnailUrl || FALLBACK_IMAGE;
  
  const finalPrice = vehicle.pricePerDay;
  const finalPriceText = finalPrice >= 1000 ? `${(finalPrice / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K` : `${finalPrice}`;
  
  const distanceText = (vehicle as any).distanceKm !== undefined 
    ? `${Number((vehicle as any).distanceKm).toFixed(1)} km`
    : `${(Math.random() * 8 + 1.2).toFixed(1)} km`;

  return (
    <div className={cn(
      "flex gap-3.5 p-3.5 bg-white dark:bg-slate-900 border rounded-3xl transition-all duration-200 select-none shadow-sm hover:shadow-md",
      isSelected ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/10" : "border-slate-150 dark:border-slate-800",
      hovered ? "border-emerald-400" : ""
    )}>
      {/* Thumbnail */}
      <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 relative">
        <img src={thumbnailSrc} alt={vehicle.name} className="w-full h-full object-cover" />
        <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] shadow-md z-10">
          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h9v7l9-11h-9z" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-white truncate leading-snug">
            {vehicle.name}
          </h4>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-405 font-bold">
            <span className="text-amber-500 text-xs">★</span>
            <span>{vehicle.rating ? Number(vehicle.rating).toFixed(1) : '5.0'}</span>
            <span>({vehicle.totalReviews || 12} chuyến)</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-450 truncate">
            <span className="text-xs">📍</span>
            <span className="truncate">{(vehicle as any).address || locationText}</span>
          </div>
        </div>

        {/* Distance & Price */}
        <div className="flex items-center justify-between mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
          <span className="text-[10px] font-bold text-slate-450 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{distanceText}</span>
          <span className="text-xs sm:text-sm font-black text-emerald-500 dark:text-emerald-400">{finalPriceText}/ngày</span>
        </div>
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

// ====== GEOCODE DATABASE FOR VIETNAMESE HOTSPOTS ======
const GEOCODE_DATABASE: Record<string, { lat: number; lng: number }> = {
  'hồ chí minh': { lat: 10.762, lng: 106.660 },
  'ho chi minh': { lat: 10.762, lng: 106.660 },
  'hà nội': { lat: 21.0285, lng: 105.8542 },
  'ha noi': { lat: 21.0285, lng: 105.8542 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'nha trang': { lat: 12.2451, lng: 109.1943 },
  'đà lạt': { lat: 11.9404, lng: 108.4583 },
  'da lat': { lat: 11.9404, lng: 108.4583 },
  'thủ đức': { lat: 10.8501, lng: 106.7712 },
  'thu duc': { lat: 10.8501, lng: 106.7712 },
  'quận 1': { lat: 10.7756, lng: 106.7004 },
  'quan 1': { lat: 10.7756, lng: 106.7004 },
  'quận 7': { lat: 10.7323, lng: 106.7176 },
  'quan 7': { lat: 10.7323, lng: 106.7176 },
  'phú quốc': { lat: 10.2186, lng: 103.9607 },
  'phu quoc': { lat: 10.2186, lng: 103.9607 },
  'vũng tàu': { lat: 10.3458, lng: 107.0843 },
  'vung tau': { lat: 10.3458, lng: 107.0843 },
};

// ====== MAIN MARKETPLACE PAGE ======
interface MarketplacePageProps {
  forceMapOpen?: boolean;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ forceMapOpen = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useUIStore();
  const isVi = language === 'vi';
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mapVehicles, setMapVehicles] = useState<VehicleLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>(() => {
    return (forceMapOpen || searchParams.get('map') === 'true') ? 'map' : 'list';
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [mapOpen, setMapOpen] = useState<boolean>(() => {
    return forceMapOpen || searchParams.get('map') === 'true';
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mapSelectedVehicles, setMapSelectedVehicles] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
      keyword: searchParams.get('q') || undefined,
    };
  });

  const loadVehicles = useCallback(async (f: VehicleFilters, p: number) => {
    setLoading(true);
    try {
      const result = await vehicleService.getAll(f, p, 12);
      setVehicles(result.data);
      setTotal(result.meta?.total || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const mapAbortControllerRef = useRef<AbortController | null>(null);

  const loadMapVehicles = useCallback(async (f: VehicleFilters) => {
    if (mapAbortControllerRef.current) {
      mapAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    mapAbortControllerRef.current = controller;

    setMapLoading(true);
    try {
      const results = await vehicleService.getMapVehicles(f, controller.signal);
      setMapVehicles(results);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error(err);
    } finally {
      if (mapAbortControllerRef.current === controller) {
        setMapLoading(false);
      }
    }
  }, []);

  // Debounced search query sync to filter keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => {
        if (prev.keyword === searchQuery) return prev;
        return { ...prev, keyword: searchQuery || undefined };
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync geocoded location string to coordinate filters
  useEffect(() => {
    const locLower = (filters.location || '').toLowerCase().trim();
    if (locLower) {
      const matched = Object.entries(GEOCODE_DATABASE).find(([k]) => locLower.includes(k) || k.includes(locLower));
      if (matched) {
        const coords = matched[1];
        setFilters(prev => {
          if (prev.userLat === coords.lat && prev.userLng === coords.lng) return prev;
          return {
            ...prev,
            userLat: coords.lat,
            userLng: coords.lng
          };
        });
      }
    }
  }, [filters.location]);

  // Load active lists
  useEffect(() => {
    loadVehicles(filters, page);
  }, [filters, page, loadVehicles]);

  // Load map markers only when map is toggled open or active in mobile view
  useEffect(() => {
    if (mapOpen || mobileViewMode === 'map') {
      loadMapVehicles(filters);
    }
  }, [filters, mapOpen, mobileViewMode, loadMapVehicles]);

  // Sync map open state from URL search parameters (?map=true)
  useEffect(() => {
    const showMap = forceMapOpen || searchParams.get('map') === 'true';
    if (showMap) {
      setMapOpen(true);
      setMobileViewMode('map');
    } else {
      setMapOpen(false);
      setMobileViewMode('list');
    }
  }, [searchParams, forceMapOpen]);

  // Clear map selection when filters change or map is closed
  useEffect(() => {
    setMapSelectedVehicles([]);
  }, [filters, mapOpen]);

  const handleTypeSwitch = (type: VehicleType | 'all') => {
    setActiveType(type);
    setPage(1);
    setFilters(prev => ({
      ...prev,
      vehicleType: type === 'all' ? undefined : type,
    }));
  };

  const handleFilterChange = (newFilters: VehicleFilters) => {
    setFilters({ ...newFilters, vehicleType: activeType === 'all' ? undefined : activeType });
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    if (newSort === 'nearest' && (!filters.userLat || !filters.userLng)) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleFilterChange({
            ...filters,
            sortBy: 'nearest',
            userLat: position.coords.latitude,
            userLng: position.coords.longitude
          });
        },
        (error) => {
          alert('Không thể xác định vị trí của bạn. Vui lòng chọn thành phố hoặc nhập từ khóa tìm kiếm để tìm xe gần bạn nhất.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      handleFilterChange({ ...filters, sortBy: newSort as any });
    }
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
                onChange={e => handleSortChange(e.target.value)}
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
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileViewMode(prev => prev === 'list' ? 'map' : 'list');
                } else {
                  setMapOpen(!mapOpen);
                }
              }}
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
          <div className={cn(
            "flex-1 min-w-0 transition-all duration-300 flex flex-col h-[calc(100vh-220px)]",
            mapOpen && (isSidebarCollapsed ? "hidden lg:w-0 overflow-hidden pr-0" : "lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-slate-100 dark:border-slate-800 pr-4 overflow-y-auto"),
            mobileViewMode === 'map' ? 'hidden lg:block' : 'block'
          )}>
            {/* Result count + active filters */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-slate-450">
                  {mapOpen ? (
                    <span className="font-extrabold text-slate-800 dark:text-white text-base">
                      Danh sách xe gần bạn ({total} xe)
                    </span>
                  ) : (
                    loading ? 'Đang tải...' : (
                      <>Tìm thấy <span className="font-extrabold text-foreground">{total}</span>
                        {' '}{activeType === 'motorbike' ? 'xe máy' : activeType === 'car' ? 'ô tô' : 'xe'}
                      </>
                    )
                  )}
                </p>
                {!mapOpen && filters.location && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5" />
                    {filters.location}
                    <button onClick={() => handleFilterChange({ ...filters, location: undefined })} className="ml-1 p-0.5 rounded-full hover:bg-accent/20">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {mapOpen ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl cursor-pointer">
                  <span>Gần tôi nhất</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              ) : (
                activeType !== 'all' && (
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border", accentClass)}>
                    {activeType === 'motorbike' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                    {activeType === 'motorbike' ? 'Xe Máy' : 'Ô Tô'}
                  </div>
                )
              )}
            </div>

            {/* Vehicle Grid */}
            {loading ? (
              <div className={cn(mapOpen ? 'space-y-4' : viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6')}>
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
                  className={cn(
                    mapOpen 
                      ? 'space-y-4 pr-1 pb-4' 
                      : viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
                      : 'space-y-6'
                  )}
                >
                  {vehicles.map(vehicle => (
                    <motion.div
                      key={vehicle.id} variants={staggerItem}
                      id={`vehicle-card-${vehicle.id}`}
                      onMouseEnter={() => setHoveredVehicleId(vehicle.id)}
                      onMouseLeave={() => setHoveredVehicleId(null)}
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        const mapLoc = mapVehicles.find(mv => mv.id === vehicle.id);
                        if (mapLoc && (window as any).luxewayMapInstance) {
                          (window as any).luxewayMapInstance.flyTo({
                            center: [mapLoc.longitude, mapLoc.latitude],
                            zoom: 14.5,
                            duration: 1000
                          });
                        }
                      }}
                      className={cn("transition-all duration-300 rounded-3xl cursor-pointer",
                        hoveredVehicleId === vehicle.id ? "ring-2 ring-accent" : "",
                        selectedVehicleId === vehicle.id ? "ring-2 ring-accent bg-accent/5 dark:bg-accent/10" : ""
                      )}
                    >
                      {mapOpen ? (
                        <CompactSidebarCard
                          vehicle={vehicle}
                          isSelected={selectedVehicleId === vehicle.id}
                          hovered={hoveredVehicleId === vehicle.id}
                          locationText={filters.location || 'Phường 14, Quận Bình Thạnh'}
                        />
                      ) : (
                        <VehicleCard vehicle={vehicle} variant={viewMode} />
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Collapse Link inside sidebar */}
                {mapOpen && !isSidebarCollapsed && (
                  <button
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all select-none flex-shrink-0"
                  >
                    <span>Thu gọn danh sách</span>
                    <span>←</span>
                  </button>
                )}

                {/* Pagination */}
                {!mapOpen && totalPages > 1 && (
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
            {(mapOpen || mobileViewMode === 'map') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex-1 sticky top-52 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative bg-slate-50 dark:bg-slate-950",
                  mobileViewMode === 'map' ? 'w-full block' : 'hidden lg:block'
                )}
                style={{ height: 'calc(100vh - 220px)' }}
              >
                <div className="relative w-full h-full">
                  <LuxeWayMap
                    vehicles={mapVehicles}
                    selectedVehicleId={selectedVehicleId}
                    hoveredVehicleId={hoveredVehicleId || undefined}
                    onSelectionChange={setMapSelectedVehicles}
                    onVehicleClick={v => {
                      setSelectedVehicleId(v.id);
                      setTimeout(() => {
                        const card = document.getElementById(`vehicle-card-${v.id}`);
                        if (card) {
                          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }}
                    onUserLocationChange={(lat, lng) => {
                      handleFilterChange({
                        ...filters,
                        userLat: lat,
                        userLng: lng
                      });
                    }}
                    height="100%"
                  />

                  {/* Floating Action Buttons (Right side overlay) */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            (window as any).luxewayMapInstance?.flyTo({
                              center: [lng, lat],
                              zoom: 14,
                              duration: 1200
                            });
                          });
                        }
                      }}
                      className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 duration-200"
                      title="Vị trí của tôi"
                    >
                      <Compass className="w-5 h-5 text-emerald-500" />
                    </button>
                    <button
                      onClick={() => {
                        if (mapVehicles.length > 0) {
                          const avgLat = mapVehicles.reduce((sum, v) => sum + (v.latitude || 0), 0) / mapVehicles.length;
                          const avgLng = mapVehicles.reduce((sum, v) => sum + (v.longitude || 0), 0) / mapVehicles.length;
                          (window as any).luxewayMapInstance?.flyTo({
                            center: [avgLng, avgLat],
                            zoom: 12.5,
                            duration: 1200
                          });
                        }
                      }}
                      className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 duration-200"
                      title="Xe gần tôi"
                    >
                      <Car className="w-5 h-5 text-emerald-500" />
                    </button>
                  </div>

                  {/* Map Legend (Bottom Right overlay) */}
                  <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl shadow-2xl z-20 flex flex-col gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-350 select-none leading-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Xe sẵn sàng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
                      <span>Vị trí của bạn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[7px]">25</span>
                      <span>Cụm xe (zoom để xem)</span>
                    </div>
                  </div>

                  {/* Floating Open Sidebar Button (Bottom Left overlay) */}
                  {mapOpen && isSidebarCollapsed && (
                    <button
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="absolute bottom-20 left-4 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-bold text-xs shadow-2xl hover:bg-neutral-950 transition-all active:scale-95 duration-200 cursor-pointer"
                    >
                      <span>Mở danh sách xe</span>
                      <span>→</span>
                    </button>
                  )}

                  {/* Floating selected vehicle cards at the bottom of the map */}
                  <AnimatePresence>
                    {mapSelectedVehicles.length > 0 && (
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute bottom-20 left-4 right-4 z-40 flex gap-4 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
                      >
                        {mapSelectedVehicles.map(v => {
                          const thumbnailSrc = v.image || v.thumbnail || FALLBACK_IMAGE;
                          const finalPrice = v.pricePerDay;
                          const originalPrice = v.pricePerDay * 1.12; // 12% discount mockup
                          const finalPriceText = finalPrice >= 1000 ? `${(finalPrice / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K` : `${finalPrice}`;
                          const originalPriceText = originalPrice >= 1000 ? `${(originalPrice / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K` : `${originalPrice}`;
                          
                          // Determine location text
                          const locationText = filters.location || 'Phường 14, Quận Bình Thạnh';

                          return (
                            <div
                              key={v.id}
                              onClick={() => {
                                const startDate = searchParams.get('startDate') || '';
                                const endDate = searchParams.get('endDate') || '';
                                const dateParams = (startDate && endDate) ? `?startDate=${startDate}&endDate=${endDate}` : '';
                                window.location.href = `/marketplace/vehicles/${v.id}${dateParams}`;
                              }}
                              className="w-[280px] sm:w-[330px] flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2.5 shadow-2xl flex gap-3 snap-start relative cursor-pointer hover:border-emerald-500 transition-all select-none duration-250 active:scale-98"
                            >
                              {/* Image section */}
                              <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 relative bg-slate-100 dark:bg-slate-800">
                                <img
                                  src={thumbnailSrc}
                                  alt={v.name}
                                  className="w-full h-full object-cover"
                                />
                                {/* Zap icon badge */}
                                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] shadow-md z-10">
                                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h9v7l9-11h-9z" />
                                  </svg>
                                </div>
                              </div>

                              {/* Info section */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-white truncate leading-snug">
                                    {v.name}
                                  </h4>
                                  
                                  {/* Rating & Trips */}
                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    <span className="text-amber-500 text-xs leading-none">★</span>
                                    <span>{v.rating ? Number(v.rating).toFixed(1) : '5.0'}</span>
                                    <span>•</span>
                                    <span>{v.totalReviews || 12} chuyến</span>
                                  </div>

                                  {/* Address */}
                                  <div className="flex items-center gap-1 mt-1.5 text-[9px] sm:text-[10px] text-slate-450">
                                    <span className="text-xs">📍</span>
                                    <span className="truncate">{locationText}</span>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-1.5 mt-1 border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
                                  <span className="text-[10px] text-slate-400 line-through font-medium">{originalPriceText}</span>
                                  <span className="text-xs sm:text-sm font-black text-emerald-500 dark:text-emerald-400">{finalPriceText}</span>
                                  <span className="text-[9px] text-slate-500 font-bold">/ngày</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading Overlay */}
                  {mapLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-300">
                      <div className="bg-slate-950/90 border border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-white">Đang tìm xe gần bạn...</span>
                      </div>
                    </div>
                  )}

                  {/* Empty Overlay */}
                  {!mapLoading && mapVehicles.length === 0 && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-350">
                      <div className="bg-slate-950/95 border border-slate-800 p-6 rounded-3xl text-center max-w-xs shadow-2xl">
                        <span className="text-4xl block mb-2">📍</span>
                        <h4 className="font-extrabold text-sm text-white mb-1">Không tìm thấy xe trong khu vực</h4>
                        <p className="text-xs text-slate-400">Hãy thử đổi vị trí hoặc mở rộng phạm vi tìm kiếm.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Toggle Button for both Desktop and Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => {
            if (isMobile) {
              setMobileViewMode(prev => prev === 'list' ? 'map' : 'list');
            } else {
              setMapOpen(!mapOpen);
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full shadow-2xl font-bold text-sm text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-950 transition-all active:scale-95 duration-200 select-none"
        >
          {(isMobile ? mobileViewMode === 'map' : mapOpen) ? (
            <>
              <span>{isVi ? 'Danh sách' : 'List View'}</span>
              <List className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              <span>{isVi ? 'Bản đồ' : 'Map View'}</span>
              <Map className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MarketplacePage;
