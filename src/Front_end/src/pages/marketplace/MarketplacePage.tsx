import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, ChevronRight,
  MapPin, Sparkles, ArrowUpDown, Shield, Car, Bike,
  Map, ZoomIn, ZoomOut, Compass, Zap, Star, Check,
  Smartphone, CloudRain, Package, UserCircle,
  Plane, Heart, Briefcase, RotateCw
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import { LuxeWayMap } from '@/components/map/LuxeWayMap';
import { useUIStore } from '@/store';
import type { Vehicle, VehicleFilters, VehicleCategory, VehicleType, VehicleLocationResponse } from '@/types';
import { formatCurrency, debounce, cn, sanitizeLocation } from '@/utils';
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
  { value: 'business', label: 'Business', icon: '👔' },
  { value: 'electric_car', label: 'Electric', icon: '⚡' },
  { value: 'sports', label: 'Sports', icon: '🏎️' },
  { value: 'pickup', label: 'Pickup', icon: '🛻' },
];

// ====== MOTORBIKE CATEGORIES ======
const MOTORBIKE_CATEGORIES: { value: VehicleCategory; label: string; icon: string }[] = [
  { value: 'scooter', label: 'Scooter', icon: '🛵' },
  { value: 'manual_motorcycle', label: 'Manual', icon: '🏍️' },
  { value: 'sport_bike', label: 'Sport Bike', icon: '🏍️' },
  { value: 'classic_bike', label: 'Classic Bike', icon: '🛵' },
  { value: 'adventure_bike', label: 'Adventure Bike', icon: '🚵' },
  { value: 'electric_bike', label: 'Electric Bike', icon: '⚡' },
];

// ====== CAR BRANDS ======
const CAR_BRANDS = ['Toyota', 'Honda', 'Hyundai', 'BMW', 'Mercedes-Benz', 'VinFast', 'Audi', 'Mitsubishi', 'Kia', 'Mazda'];

// ====== MOTORBIKE BRANDS ======
const MOTO_BRANDS = ['Honda', 'Yamaha', 'Vespa', 'Suzuki', 'Kawasaki', 'Ducati', 'VinFast', 'Piaggio', 'BMW'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'nearest', label: 'Nearest to me' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
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
  const { language } = useUIStore();
  const isVi = language === 'vi';
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
            <span>({vehicle.totalReviews || 12} {isVi ? 'chuyến' : 'trips'})</span>
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
          <span className="text-xs sm:text-sm font-black text-emerald-500 dark:text-emerald-400">{finalPriceText}/{isVi ? 'ngày' : 'day'}</span>
        </div>
      </div>
    </div>
  );
};



// ====== CAR FILTER PANEL ======
const CarFilterPanel: React.FC<{ filters: VehicleFilters; onChange: (f: VehicleFilters) => void; onClose?: () => void }> = ({ filters, onChange, onClose }) => {
  const t = useT();
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice ?? 0, filters.maxPrice ?? 15000000]);

  const toggle = (key: keyof VehicleFilters, val: any) => {
    const arr: any[] = (filters as any)[key] || [];
    const next = arr.includes(val) ? arr.filter((x: any) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next.length > 0 ? next : undefined });
  };

  const toggleBool = (key: keyof VehicleFilters) =>
    onChange({ ...filters, [key]: !(filters as any)[key] || undefined });

  return (
    <div className="space-y-6 pb-2">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-500" /> Car Filters
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onChange({ vehicleType: 'car' })} className="text-xs text-accent hover:underline font-bold">Clear Filters</button>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Category</p>
        <div className="grid grid-cols-2 gap-2">
          {CAR_CATEGORIES.map(cat => {
            const sel = (filters.category || []).includes(cat.value);
            return (
              <button key={cat.value} onClick={() => toggle('category', cat.value)}
                className={cn("px-2 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                <span>{cat.icon}</span>{t.categories[cat.value as keyof typeof t.categories] || cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Price / Day</p>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Seats</p>
        <div className="flex gap-2">
          {[4, 5, 7, 9].map(s => (
            <button key={s} onClick={() => onChange({ ...filters, minSeats: filters.minSeats === s ? undefined : s })}
              className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                filters.minSeats === s ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
              {s} seats
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Transmission</p>
        <div className="flex gap-2">
          {(['automatic', 'manual'] as const).map(t => {
            const sel = (filters.transmission || []).includes(t);
            return (
              <button key={t} onClick={() => { onChange({ ...filters, transmission: sel ? undefined : [t] }); }}
                className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize",
                  sel ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                {t === 'automatic' ? 'Automatic' : 'Manual'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Fuel Type</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'gasoline', l: '⛽ Gasoline' }, { v: 'diesel', l: '🛢️ Diesel' }, { v: 'hybrid', l: '🌿 Hybrid' }, { v: 'electric', l: '⚡ Electric' }].map(f => {
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Brands</p>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Special Services</p>
        <div className="space-y-2">
          {[
            { key: 'hasChauffeur', icon: <UserCircle className="w-3.5 h-3.5" />, label: 'Chauffeur Included' },
            { key: 'airportDelivery', icon: <Plane className="w-3.5 h-3.5" />, label: 'Airport Delivery' },
            { key: 'weddingRental', icon: <Heart className="w-3.5 h-3.5" />, label: 'Wedding Rental' },
            { key: 'businessRental', icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Business Rental' },
            { key: 'deliveryAvailable', icon: <MapPin className="w-3.5 h-3.5" />, label: 'Door Delivery' },
            { key: 'instantBook', icon: <Zap className="w-3.5 h-3.5" />, label: 'Instant Book' },
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Minimum Rating</p>
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
  const t = useT();
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice ?? 0, filters.maxPrice ?? 1500000]);

  const toggle = (key: keyof VehicleFilters, val: any) => {
    const arr: any[] = (filters as any)[key] || [];
    const next = arr.includes(val) ? arr.filter((x: any) => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next.length > 0 ? next : undefined });
  };

  const toggleBool = (key: keyof VehicleFilters) =>
    onChange({ ...filters, [key]: !(filters as any)[key] || undefined });

  return (
    <div className="space-y-6 pb-2">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
          <Bike className="w-4 h-4 text-orange-500" /> Motorbike Filters
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onChange({ vehicleType: 'motorbike' })} className="text-xs text-orange-500 hover:underline font-bold">Clear Filters</button>
          {onClose && <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Motorbike categories */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Motorbike Category</p>
        <div className="grid grid-cols-2 gap-2">
          {MOTORBIKE_CATEGORIES.map(cat => {
            const sel = (filters.category || []).includes(cat.value);
            return (
              <button key={cat.value} onClick={() => toggle('category', cat.value)}
                className={cn("px-2 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5",
                  sel ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400")}>
                <span>{cat.icon}</span>{t.categories[cat.value as keyof typeof t.categories] || cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range for motorbikes */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Price / Day</p>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Engine Size (CC)</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '<125cc', min: 0, max: 125 },
            { label: '125-200cc', min: 125, max: 200 },
            { label: '200cc+', min: 200, max: 9999 },
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Transmission</p>
        <div className="flex gap-2">
          {[{ v: 'automatic', l: '🔄 Automatic' }, { v: 'manual', l: '⚙️ Manual' }].map(t => {
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Fuel Type</p>
        <div className="flex gap-2">
          {[{ v: 'gasoline', l: '⛽ Gasoline' }, { v: 'electric', l: '⚡ Electric' }].map(f => {
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Brands</p>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Included Equipment</p>
        <div className="space-y-2">
          {[
            { key: 'hasHelmet', icon: '🪖', label: 'Helmets' },
            { key: 'hasPhoneHolder', icon: '📱', label: 'Phone Holder' },
            { key: 'hasRaincoat', icon: '🌧️', label: 'Raincoat' },
            { key: 'hasTouringPackage', icon: '🧳', label: 'Touring Package' },
            { key: 'instantBook', icon: '⚡', label: 'Instant Book' },
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
  'cần thơ': { lat: 10.0371, lng: 105.7882 },
  'can tho': { lat: 10.0371, lng: 105.7882 },
  'hải phòng': { lat: 20.8449, lng: 106.6881 },
  'hai phong': { lat: 20.8449, lng: 106.6881 },
  'huế': { lat: 16.4637, lng: 107.5909 },
  'hue': { lat: 16.4637, lng: 107.5909 },
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
const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();
  const isVi = language === 'vi';

  // Derive map view mode from URL path or query param
  const isMapView = location.pathname === '/map' || searchParams.get('view') === 'map';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mapVehicles, setMapVehicles] = useState<VehicleLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>(() => {
    return isMapView ? 'map' : 'list';
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [mapOpen, setMapOpen] = useState<boolean>(isMapView);

  // Rebuild states
  const [showCarousel, setShowCarousel] = useState<boolean>(false);
  const [showSearchArea, setShowSearchArea] = useState<boolean>(false);
  const [mapBounds, setMapBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);
  const [appliedMapBounds, setAppliedMapBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);
  const [shouldFitBounds, setShouldFitBounds] = useState<boolean>(true);
  const [hoveredMapVehicleId, setHoveredMapVehicleId] = useState<string | null>(null);

  // Carousel scroll ref for map view bottom carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mapSelectedVehicles, setMapSelectedVehicles] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowFloatingButton(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }
      if (currentScrollY > lastScrollYRef.current) {
        setShowFloatingButton(false);
      } else {
        setShowFloatingButton(true);
      }
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    const categories = searchParams.getAll('category') as VehicleCategory[];
    const brands = searchParams.getAll('brands');
    const minEngineCc = searchParams.get('minEngineCc');
    const maxEngineCc = searchParams.get('maxEngineCc');
    return {
      vehicleType: type || undefined,
      location: searchParams.get('location') || undefined,
      sortBy: (searchParams.get('sort') as VehicleFilters['sortBy']) || 'popular',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      keyword: searchParams.get('q') || undefined,
      category: categories.length > 0 ? categories : undefined,
      brands: brands.length > 0 ? brands : undefined,
      minEngineCc: minEngineCc ? parseInt(minEngineCc, 10) : undefined,
      maxEngineCc: maxEngineCc ? parseInt(maxEngineCc, 10) : undefined,
      instantBook: searchParams.get('instantBook') === 'true' || undefined,
      deliveryAvailable: searchParams.get('deliveryAvailable') === 'true' || undefined,
      hasHelmet: searchParams.get('hasHelmet') === 'true' || undefined,
      hasPhoneHolder: searchParams.get('hasPhoneHolder') === 'true' || undefined,
      hasRaincoat: searchParams.get('hasRaincoat') === 'true' || undefined,
      hasTouringPackage: searchParams.get('hasTouringPackage') === 'true' || undefined,
      hasChauffeur: searchParams.get('hasChauffeur') === 'true' || undefined,
      airportDelivery: searchParams.get('airportDelivery') === 'true' || undefined,
      weddingRental: searchParams.get('weddingRental') === 'true' || undefined,
      businessRental: searchParams.get('businessRental') === 'true' || undefined,
    };
  });

  const hasUrlDrivenFilters = useMemo(() => {
    const filterKeys = [
      'type', 'location', 'sort', 'startDate', 'endDate', 'q',
      'category', 'brands', 'minEngineCc', 'maxEngineCc',
      'instantBook', 'deliveryAvailable', 'hasHelmet', 'hasPhoneHolder',
      'hasRaincoat', 'hasTouringPackage', 'hasChauffeur',
      'airportDelivery', 'weddingRental', 'businessRental',
    ];
    return filterKeys.some(key => searchParams.has(key));
  }, [searchParams]);

  // Persist Map State (Load on mount)
  useEffect(() => {
    if (isMapView) {
      try {
        const saved = sessionStorage.getItem('luxeway_map_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.filters && !hasUrlDrivenFilters) {
            setFilters(prev => ({ ...prev, ...parsed.filters }));
          }
          if (parsed.selectedVehicleId) {
            setSelectedVehicleId(parsed.selectedVehicleId);
          }
          if (parsed.showCarousel !== undefined) {
            setShowCarousel(parsed.showCarousel);
          }
        }
      } catch (e) {
        console.warn('Failed to restore map state', e);
      }
    }
  }, [isMapView, hasUrlDrivenFilters]);

  // Persist Map State (Save on changes)
  useEffect(() => {
    if (isMapView) {
      try {
        const stateToSave = {
          filters,
          selectedVehicleId,
          showCarousel,
        };
        sessionStorage.setItem('luxeway_map_state', JSON.stringify(stateToSave));
      } catch (e) { /* Ignore storage errors */ }
    }
  }, [filters, selectedVehicleId, showCarousel, isMapView]);

  // Sync state back to URL parameters dynamically on filter changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.vehicleType) params.set('type', filters.vehicleType);
    if (filters.location) params.set('location', filters.location);
    if (filters.sortBy && filters.sortBy !== 'popular') params.set('sort', filters.sortBy);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.keyword) params.set('q', filters.keyword);

    if (filters.category && filters.category.length > 0) {
      filters.category.forEach(c => params.append('category', c));
    }
    if (filters.brands && filters.brands.length > 0) {
      filters.brands.forEach(b => params.append('brands', b));
    }

    if (filters.minEngineCc !== undefined) params.set('minEngineCc', filters.minEngineCc.toString());
    if (filters.maxEngineCc !== undefined) params.set('maxEngineCc', filters.maxEngineCc.toString());

    if (filters.instantBook) params.set('instantBook', 'true');
    if (filters.deliveryAvailable) params.set('deliveryAvailable', 'true');
    if (filters.hasHelmet) params.set('hasHelmet', 'true');
    if (filters.hasPhoneHolder) params.set('hasPhoneHolder', 'true');
    if (filters.hasRaincoat) params.set('hasRaincoat', 'true');
    if (filters.hasTouringPackage) params.set('hasTouringPackage', 'true');
    if (filters.hasChauffeur) params.set('hasChauffeur', 'true');
    if (filters.airportDelivery) params.set('airportDelivery', 'true');
    if (filters.weddingRental) params.set('weddingRental', 'true');
    if (filters.businessRental) params.set('businessRental', 'true');

    // Retain page context if present or view mode
    const viewParam = searchParams.get('view');
    if (viewParam) params.set('view', viewParam);
    const vehicleParam = searchParams.get('vehicle');
    if (vehicleParam) params.set('vehicle', vehicleParam);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Handle deep link /map?vehicle=id
  useEffect(() => {
    const vehicleId = searchParams.get('vehicle');
    if (vehicleId && isMapView) {
      setSelectedVehicleId(vehicleId);
      setShowCarousel(true);
      setFilters(prev => ({ ...prev, keyword: undefined })); // Clear search input to show the vehicle
    }
  }, [searchParams, isMapView]);

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

  // Sync map open state from URL (path or query param)
  useEffect(() => {
    if (isMapView) {
      setMapOpen(true);
      setMobileViewMode('map');
    } else {
      setMapOpen(false);
      setMobileViewMode('list');
    }
  }, [isMapView]);

  // Clear map selection when filters change or map is closed
  useEffect(() => {
    setMapSelectedVehicles([]);
    // Fit bounds on filter changes, not user pan
    setShouldFitBounds(true);
    setShowSearchArea(false);
    setAppliedMapBounds(null);
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

  const visibleMapVehicles = useMemo(() => {
    if (!appliedMapBounds) return mapVehicles;
    return mapVehicles.filter(vehicle => {
      const lat = Number(vehicle.latitude);
      const lng = Number(vehicle.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      return (
        lat >= appliedMapBounds.minLat &&
        lat <= appliedMapBounds.maxLat &&
        lng >= appliedMapBounds.minLng &&
        lng <= appliedMapBounds.maxLng
      );
    });
  }, [mapVehicles, appliedMapBounds]);

  const mapDisplayTotal = appliedMapBounds ? visibleMapVehicles.length : mapVehicles.length;

  // Type colors
  const typeColor = activeType === 'motorbike' ? 'orange' : activeType === 'car' ? 'blue' : 'accent';
  const accentClass = activeType === 'motorbike' ? 'text-orange-500 border-orange-500 bg-orange-500/10'
    : activeType === 'car' ? 'text-blue-500 border-blue-500 bg-blue-500/10'
      : 'text-accent border-accent bg-accent/10';

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background pt-16">
      {/* ====== STICKY FILTER AND HEADER SECTION ====== */}
      <div className="sticky top-0 z-40 bg-card border-b border-slate-100 dark:border-slate-800 shadow-sm flex-shrink-0">
        {/* ====== VEHICLE TYPE TABS ====== */}
        <div className="border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
              {[
                { type: 'all' as const, label: isVi ? 'Tất Cả Xe' : 'All Vehicles', icon: <Sparkles className="w-4 h-4" />, count: null },
                { type: 'car' as const, label: isVi ? 'Ô Tô' : 'Cars', icon: <Car className="w-4 h-4" />, count: null },
                { type: 'motorbike' as const, label: isVi ? 'Xe Máy' : 'Motorbikes', icon: <Bike className="w-4 h-4" />, count: null },
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
                      {loading || mapLoading ? '...' : (isMapView ? mapDisplayTotal : total)}
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
          "bg-card",
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
                placeholder={activeType === 'motorbike' ? '🏍️ Find motorbikes... Vision, Exciter, SH...' : activeType === 'car' ? '🚗 Find cars... Vios, Camry, CX5...' : '🔍 Find vehicles... Honda, Toyota, VinFast...'}
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
              <span className="hidden sm:inline">Filters</span>
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
                const params = new URLSearchParams(searchParams);
                params.delete('view');
                const qs = params.toString();
                if (isMapView) {
                  navigate(`/vehicles${qs ? `?${qs}` : ''}`);
                } else {
                  navigate(`/map${qs ? `?${qs}` : ''}`);
                }
              }}
              className={cn(
                "hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 shadow-sm border",
                isMapView
                  ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B1221] shadow-md"
                  : "bg-[#0B1221] dark:bg-slate-900 border-[#1E2D45] text-white hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              )}>
              {isMapView ? (
                <>
                  <List className="w-4 h-4" />
                  <span>{isVi ? 'Danh sách' : 'List'}</span>
                </>
              ) : (
                <>
                  <Map className="w-4 h-4" />
                  <span>{isVi ? 'Bản đồ' : 'Map'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>

      <div className={cn("mx-auto flex-1 overflow-hidden w-full flex flex-col", isMapView ? "px-0 py-0" : "max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4")}>
        <div className={cn("flex-1 flex items-stretch w-full min-h-0", isMapView ? "gap-0 flex-col overflow-hidden" : "gap-6 overflow-hidden")}>
          {/* Filter Sidebar */}
          <AnimatePresence>
            {showFilters && !mapOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden xl:flex flex-shrink-0 h-full scrollbar-hide"
                style={{ minWidth: 0, overflowX: 'clip', overflowY: 'auto' }}
              >
                <div className="w-[284px] bg-card rounded-3xl border border-slate-150 dark:border-slate-800 p-6 shadow-sm flex-shrink-0 mr-4">
                  {activeType === 'motorbike' ? (
                    <MotorbikeFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                  ) : (
                    <CarFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className={cn(
            "flex-1 min-w-0 transition-all duration-300 flex flex-col h-full overflow-y-auto pr-2 pb-16",
            isMapView ? "hidden" : (mapOpen || mobileViewMode === 'map') ? "hidden" : "block"
          )}>
            {/* Result count + active filters */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-slate-450">
                  {mapOpen ? (
                    <span className="font-extrabold text-slate-800 dark:text-white text-base">
                      Vehicles near you ({total})
                    </span>
                  ) : (
                    loading ? 'Loading...' : (
                      <>Found <span className="font-extrabold text-foreground">{total}</span>
                        {' '}{activeType === 'motorbike' ? 'motorbikes' : activeType === 'car' ? 'cars' : 'vehicles'}
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
                  <span>Nearest to me</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              ) : (
                activeType !== 'all' && (
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border", accentClass)}>
                    {activeType === 'motorbike' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                    {activeType === 'motorbike' ? 'Motorbikes' : 'Cars'}
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
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">No vehicles found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Try adjusting the filters or searching with different keywords.</p>
                <button onClick={() => { setFilters({ vehicleType: activeType === 'all' ? undefined : activeType }); setSearchQuery(''); }}
                  className="btn-primary px-6 py-2.5">Clear Filters</button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={staggerContainer} initial="hidden" animate="visible"
                  className={cn(
                    mapOpen
                      ? 'space-y-4 pr-1 pb-4'
                      : viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
                  "overflow-hidden relative bg-slate-50 dark:bg-slate-950 h-full flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg",
                  mobileViewMode === 'map' ? 'w-full block' : 'hidden lg:block'
                )}
              >
                <div className="relative w-full h-full">
                  <LuxeWayMap
                    vehicles={visibleMapVehicles}
                    selectedVehicleId={selectedVehicleId}
                    hoveredVehicleId={hoveredMapVehicleId || hoveredVehicleId || undefined}
                    onSelectionChange={setMapSelectedVehicles}
                    onMarkerHover={setHoveredMapVehicleId}
                    onBoundsChange={setMapBounds}
                    onMapMoved={() => {
                      setShowSearchArea(true);
                      setShouldFitBounds(false); // Disable auto-fit once user interacts
                    }}
                    onVehicleClick={v => {
                      setSelectedVehicleId(v.id);
                      setShowCarousel(true);
                      setTimeout(() => {
                        const carouselCard = document.getElementById(`map-carousel-card-${v.id}`);
                        if (carouselCard) {
                          carouselCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
                    initialCenter={
                      (() => {
                        try {
                          const saved = sessionStorage.getItem('luxeway_map_state');
                          if (saved) {
                            const parsed = JSON.parse(saved);
                            if (parsed.filters?.userLng && parsed.filters?.userLat) {
                              return [parsed.filters.userLng, parsed.filters.userLat];
                            }
                          }
                        } catch (e) {}
                        
                        const loc = (filters.location || '').toLowerCase().trim();
                        if (!loc) return [106.660, 10.762]; // Default: HCM
                        const match = Object.entries(GEOCODE_DATABASE).find(([k]) => loc.includes(k) || k.includes(loc));
                        return match ? [match[1].lng, match[1].lat] : [106.660, 10.762];
                      })()
                    }
                    initialZoom={filters.location ? 12.7 : undefined}
                    shouldFitBounds={shouldFitBounds}
                    height="100%"
                  />

                  {/* "Tìm trong khu vực này" Search Area Button */}
                  <AnimatePresence>
                    {showSearchArea && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                      >
                        <button
                          onClick={async () => {
                            setShowSearchArea(false);
                            if (mapBounds) {
                              setAppliedMapBounds(mapBounds);
                            }
                            setShouldFitBounds(false);
                            setMapLoading(true); // Triggers loading skeletons for markers/cards
                            try {
                              // Enrichment/load callback
                              await loadMapVehicles(filters);
                            } finally {
                              setMapLoading(false);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg text-xs font-black text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 duration-200"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-accent animate-spin-slow" />
                          <span>{isVi ? 'Tìm trong khu vực này' : 'Search this area'}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Locate Me GPS button (Mioto Style) */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            
                            // Fly to user GPS coords
                            (window as any).luxewayMapInstance?.flyTo({
                              center: [lng, lat],
                              zoom: 14.5,
                              duration: 1300
                            });

                            // Add a pulse indicator element on the map
                            const userLocEl = document.createElement('div');
                            userLocEl.className = 'w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-lg relative flex items-center justify-center';
                            const pingEl = document.createElement('div');
                            pingEl.className = 'absolute -inset-2 bg-blue-400/40 rounded-full animate-ping';
                            userLocEl.appendChild(pingEl);

                            // Label popup for Locate Me
                            const popup = new maplibregl.Popup({ closeButton: false, offset: 15 })
                              .setText(isVi ? 'Bạn đang ở đây' : 'You are here');

                            new maplibregl.Marker({ element: userLocEl })
                              .setLngLat([lng, lat])
                              .setPopup(popup)
                              .addTo((window as any).luxewayMapInstance);
                          });
                        }
                      }}
                      className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer active:scale-90 duration-200"
                      title={isVi ? 'Vị trí của tôi' : 'My Location'}
                    >
                      <Compass className="w-5.5 h-5.5 text-accent animate-pulse" />
                    </button>
                  </div>

                  {/* Bottom Carousel (Airbnb/Mioto style) */}
                  <AnimatePresence>
                    {(isMapView ? (showCarousel && visibleMapVehicles.length > 0) : mapSelectedVehicles.length > 0) && (
                      <motion.div
                        initial={{ y: 150, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 150, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        ref={isMapView ? carouselRef : undefined}
                        className={cn(
                          "absolute z-45 flex gap-4 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth",
                          isMapView
                            ? "bottom-16 left-0 right-0 max-w-full md:px-8 lg:px-16"
                            : "bottom-20 left-4 right-4"
                        )}
                      >
                        {(isMapView ? visibleMapVehicles : mapSelectedVehicles).map(v => {
                          const thumbnailSrc = (v as any).image || (v as any).thumbnail || (v as any).thumbnailUrl || (v as any).images?.[0] || FALLBACK_IMAGE;
                          const finalPrice = Number((v as any).finalPrice || v.pricePerDay || 0);
                          const originalPrice = Number(v.pricePerDay || finalPrice) * 1.12;
                          const finalPriceText = finalPrice >= 1000 ? `${(finalPrice / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K` : `${finalPrice}`;
                          const originalPriceText = originalPrice >= 1000 ? `${(originalPrice / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K` : `${originalPrice}`;
                          const locationText = sanitizeLocation(filters.location || v.address || 'TP. Hồ Chí Minh');
                          const isSelected = selectedVehicleId === v.id;
                          const isHovered = hoveredMapVehicleId === v.id || hoveredVehicleId === v.id;

                          return (
                            <div
                              key={v.id}
                              id={`map-carousel-card-${v.id}`}
                              onClick={() => {
                                setSelectedVehicleId(v.id);
                                if (isMapView) {
                                  // Highlight marker + center map
                                  const mapLoc = visibleMapVehicles.find(mv => mv.id === v.id);
                                  if (mapLoc && (window as any).luxewayMapInstance) {
                                    (window as any).luxewayMapInstance.flyTo({
                                      center: [mapLoc.longitude, mapLoc.latitude],
                                      zoom: 15,
                                      duration: 1200
                                    });
                                  }
                                }
                              }}
                              onDoubleClick={() => {
                                // Navigate to vehicle detail view on double-click
                                const startDate = searchParams.get('startDate') || '';
                                const endDate = searchParams.get('endDate') || '';
                                const dateParams = (startDate && endDate) ? `?startDate=${startDate}&endDate=${endDate}` : '';
                                const vehicleType = ((v as any).vehicleType || (v as any).type || '').toString().toLowerCase();
                                const detailPath = vehicleType === 'motorbike' ? `/motorbikes/${v.id}` : `/cars/${v.id}`;
                                navigate(`${detailPath}${dateParams}`);
                              }}
                              onMouseEnter={() => setHoveredMapVehicleId(v.id)}
                              onMouseLeave={() => setHoveredMapVehicleId(null)}
                              className={cn(
                                "flex-shrink-0 bg-white dark:bg-slate-900 border rounded-3xl p-3 shadow-2xl flex gap-3 snap-start relative cursor-pointer transition-all duration-250 active:scale-[0.98]",
                                isMobile ? "w-[290px] h-[130px]" : "w-[340px] h-[145px]",
                                isSelected
                                  ? "border-accent ring-2 ring-accent/35 scale-[1.01]"
                                  : isHovered
                                    ? "border-accent/60 ring-2 ring-accent/15"
                                    : "border-slate-200 dark:border-slate-800"
                              )}
                            >
                              {/* Image section */}
                              <div className="w-24 h-full sm:w-28 rounded-2xl overflow-hidden flex-shrink-0 relative bg-slate-100 dark:bg-slate-800">
                                <img
                                  src={thumbnailSrc}
                                  alt={v.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                {/* Zap icon badge */}
                                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow-md z-10">
                                  <Zap className="w-3 h-3 fill-current" />
                                </div>
                              </div>

                              {/* Info section */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                  <h4 className="font-black text-xs sm:text-sm text-slate-800 dark:text-white truncate leading-snug">
                                    {v.name}
                                  </h4>

                                  {/* Rating & Trips */}
                                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                    <span>{v.rating ? Number(v.rating).toFixed(1) : '5.0'}</span>
                                    <span>•</span>
                                    <span>{v.totalReviews || 18} {isVi ? 'chuyến' : 'trips'}</span>
                                  </div>

                                  {/* Seats & Transmission */}
                                  <div className="flex gap-2 mt-1 text-[9px] font-bold text-slate-400">
                                    <span>{v.seats || 4} {isVi ? 'chỗ' : 'seats'}</span>
                                    <span>•</span>
                                    <span>{v.transmission === 'automatic' || (v as any).transmission === 'AUTOMATIC' ? (isVi ? 'Tự động' : 'Auto') : (isVi ? 'Số sàn' : 'Manual')}</span>
                                  </div>
                                </div>

                                {/* Price / Day */}
                                <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 mt-1">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] text-slate-450 line-through font-medium">{originalPriceText}</span>
                                    <span className="text-xs sm:text-sm font-black text-emerald-500 dark:text-emerald-450">{finalPriceText}</span>
                                    <span className="text-[9px] text-slate-450 font-bold">/{isVi ? 'ngày' : 'day'}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading Skeletons Overlay (Markers & Cards) */}
                  {mapLoading && (
                    <div className="absolute inset-0 bg-slate-900/15 pointer-events-none flex flex-col justify-end z-30 transition-all duration-300">
                      {/* Pulse cards skeleton */}
                      <div className="flex gap-4 px-4 pb-6 overflow-hidden max-w-full">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-[320px] h-[130px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex gap-3 animate-pulse shadow-2xl">
                            <div className="w-24 h-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                            <div className="flex-1 py-2 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                                <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                              </div>
                              <div className="w-3/4 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State Overlay with Illustration */}
                  {!mapLoading && visibleMapVehicles.length === 0 && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-30 transition-all duration-350">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center max-w-md shadow-2xl mx-4">
                        <div className="text-6xl mb-4 animate-bounce-slow">🚗</div>
                        <h4 className="font-black text-base text-slate-800 dark:text-white mb-2">
                          {isVi ? 'Không tìm thấy xe phù hợp' : 'No matching vehicles found'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                          {isVi
                            ? 'Chúng tôi không tìm thấy xe nào trong khu vực này. Thử xóa bớt bộ lọc hoặc chọn khu vực lân cận khác xem sao nhé!'
                            : 'We couldn\'t find any vehicles in this area. Try clearing filters or searching nearby locations!'}
                        </p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => {
                              setFilters({ vehicleType: activeType === 'all' ? undefined : activeType });
                              setSearchQuery('');
                            }}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            {isVi ? 'Xóa bộ lọc' : 'Clear Filters'}
                          </button>
                          <button
                            onClick={() => {
                              // Reset location to default HCM center to switch area
                              setFilters(prev => ({ ...prev, location: undefined }));
                            }}
                            className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors shadow-lg"
                          >
                            {isVi ? 'Đổi khu vực' : 'Change Area'}
                          </button>
                        </div>
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
      <AnimatePresence>
        {showFloatingButton && (
          <motion.div
            initial={{ y: 80, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 80, x: '-50%', opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={cn("fixed left-1/2 z-50", isMapView ? "bottom-24 sm:bottom-28" : "bottom-6")}
          >
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('view');
                const qs = params.toString();
                if (isMapView) {
                  navigate(`/vehicles${qs ? `?${qs}` : ''}`);
                } else {
                  navigate(`/map${qs ? `?${qs}` : ''}`);
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl font-black text-sm text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-950 transition-all active:scale-95 duration-200 select-none cursor-pointer"
            >
              {isMapView ? (
                <>
                  <span>{isVi ? 'Danh sách' : 'List View'}</span>
                  <List className="w-4.5 h-4.5 ml-1" />
                </>
              ) : (
                <>
                  <span>{isVi ? 'Bản đồ' : 'Map View'}</span>
                  <Map className="w-4.5 h-4.5 ml-1" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Advanced Filters Overlay Drawer (Mioto Style) */}
      <AnimatePresence>
        {mapOpen && showFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all duration-300"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[350px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[100] p-6 overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 flex-shrink-0">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-accent" />
                  {isVi ? 'Bộ Lọc Nâng Cao' : 'Advanced Filters'}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-foreground hover:bg-slate-250 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Panel Content */}
              <div className="flex-1 overflow-y-auto pr-1">
                {activeType === 'motorbike' ? (
                  <MotorbikeFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                ) : (
                  <CarFilterPanel filters={filters} onChange={handleFilterChange} onClose={() => setShowFilters(false)} />
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setFilters({ vehicleType: activeType === 'all' ? undefined : activeType });
                    setSearchQuery('');
                    setShowFilters(false);
                  }}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {isVi ? 'Thiết lập lại' : 'Reset'}
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors shadow-lg"
                >
                  {isVi ? 'Áp dụng' : 'Apply'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplacePage;
