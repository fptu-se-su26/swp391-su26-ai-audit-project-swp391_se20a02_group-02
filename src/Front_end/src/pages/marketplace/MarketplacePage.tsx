import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown,
  MapPin, Sparkles, ArrowUpDown, Shield, Clock, BadgePercent, Check, CheckCircle2,
  Map, ZoomIn, ZoomOut, Compass, RefreshCw, Zap, Star
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import type { Vehicle, VehicleFilters, VehicleCategory } from '@/types';
import { formatCurrency, debounce, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { useT } from '@/i18n/translations';
import { VehicleMap } from '@/components/map/VehicleMap';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

const CATEGORIES: { value: VehicleCategory; labelKey: string }[] = [
  { value: 'motorbike', labelKey: 'motorbike' },
  { value: 'economy', labelKey: 'economy' },
  { value: 'family', labelKey: 'family' },
  { value: 'suv', labelKey: 'suv' },
  { value: 'city_car', labelKey: 'city_car' },
  { value: 'business', labelKey: 'business' },
  { value: 'electric', labelKey: 'electric' },
  { value: 'tourism', labelKey: 'tourism' },
];

const SORT_OPTIONS = [
  { value: 'popular', labelKey: 'mostPopular' },
  { value: 'rating', labelKey: 'highestRated' },
  { value: 'price_asc', labelKey: 'priceLowHigh' },
  { value: 'price_desc', labelKey: 'priceHighLow' },
  { value: 'newest', labelKey: 'newestFirst' },
];

// ====== MAP SIMULATOR ======
interface MapSimulatorProps {
  vehicles: Vehicle[];
  hoveredVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

const MapSimulator: React.FC<MapSimulatorProps> = ({ vehicles, hoveredVehicleId, onSelectVehicle }) => {
  const [zoom, setZoom] = useState(13);
  const [selectedPin, setSelectedPin] = useState<Vehicle | null>(null);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset selected pin if catalog updates and pin is not in the list
  useEffect(() => {
    if (selectedPin && !vehicles.some(v => v.id === selectedPin.id)) {
      setSelectedPin(null);
    }
  }, [vehicles, selectedPin]);

  // Handle map dragging (panning simulation)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - centerOffset.x, y: e.clientY - centerOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCenterOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetMap = () => {
    setCenterOffset({ x: 0, y: 0 });
    setZoom(13);
    setSelectedPin(null);
  };

  return (
    <div
      className="relative w-full h-full bg-[#1e293b] overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Grid Vector Background */}
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${centerOffset.x}px, ${centerOffset.y}px) scale(${zoom / 13})`,
          backgroundImage: 'radial-gradient(circle, #334155 1.5px, transparent 1.5px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '30px 30px, 90px 90px, 90px 90px',
          backgroundPosition: 'center'
        }}
      >
        {/* District Text Labels */}
        <div className="absolute top-[20%] left-[30%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">District 1 (Center)</div>
        <div className="absolute top-[45%] left-[60%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">District 2 (Thao Dien)</div>
        <div className="absolute top-[70%] left-[20%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">District 7 (Phu My Hung)</div>
        <div className="absolute top-[10%] left-[75%] text-slate-500 font-bold tracking-widest text-xs uppercase opacity-40">Binh Thanh</div>

        {/* Vector Roads */}
        <svg className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 opacity-20 pointer-events-none" stroke="#475569" strokeWidth="2" fill="none">
          <path d="M 0 300 Q 400 350 800 500 T 1600 600" />
          <path d="M 300 0 Q 450 500 600 1200" />
          <path d="M 100 800 C 500 700 900 900 1500 800" strokeWidth="4" stroke="#64748b" />
          <path d="M 800 100 C 900 600 1000 800 1100 1200" strokeWidth="3" />
        </svg>

        {/* River outline */}
        <svg className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 opacity-30 pointer-events-none" stroke="#1e3a8a" strokeWidth="40" fill="none" strokeLinecap="round">
          <path d="M 200 0 Q 300 400 700 450 T 1100 800 T 1600 1200" />
        </svg>

        {/* Price Marker Pins */}
        {vehicles.map((v, index) => {
          // Generate deterministic mock coordinates centered around HCMC Map if DB coordinate is empty
          const latOffset = v.location?.lat ? (v.location.lat - 10.762) * 500 : (Math.sin(index * 45) * 150);
          const lngOffset = v.location?.lng ? (v.location.lng - 106.66) * 500 : (Math.cos(index * 45) * 150);

          const isHovered = hoveredVehicleId === v.id;
          const isSelected = selectedPin?.id === v.id;

          return (
            <div
              key={v.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPin(v);
                onSelectVehicle(v.id);
              }}
              className="absolute cursor-pointer transition-all duration-200"
              style={{
                top: `calc(50% + ${latOffset}px)`,
                left: `calc(50% + ${lngOffset}px)`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 50 : isHovered ? 40 : 20
              }}
            >
              <div
                className={cn(
                  "px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border flex items-center gap-1",
                  isSelected
                    ? "bg-accent border-accent text-white scale-110"
                    : isHovered
                      ? "bg-slate-100 border-accent text-accent dark:bg-slate-900 scale-105"
                      : "bg-slate-900/90 border-slate-700/80 text-white dark:bg-slate-900/90 hover:scale-105"
                )}
              >
                {v.instantBook && <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
                {formatCurrency(v.pricePerDay)}
              </div>
              <div
                className={cn(
                  "w-2 h-2 rounded-full mx-auto mt-1 border border-white shadow",
                  isSelected ? "bg-accent" : isHovered ? "bg-accent" : "bg-slate-500"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Map Control Overlays */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 16))}
          className="w-10 h-10 bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center rounded-xl shadow-lg backdrop-blur hover:bg-slate-800"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 10))}
          className="w-10 h-10 bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center rounded-xl shadow-lg backdrop-blur hover:bg-slate-800"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetMap}
          className="w-10 h-10 bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center rounded-xl shadow-lg backdrop-blur hover:bg-slate-800"
          title="Recenter Map"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Dynamic Popover preview on click pin */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-slate-900/95 border border-slate-800/80 backdrop-blur rounded-3xl p-4 shadow-2xl z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-3 right-3 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-4">
              <img
                src={selectedPin.images?.[0] || selectedPin.thumbnailUrl || FALLBACK_IMAGE}
                alt={selectedPin.name}
                className="w-24 h-20 object-cover rounded-2xl bg-slate-800"
              />
              <div className="flex-1 min-w-0 pr-4">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{selectedPin.brand}</span>
                <h4 className="font-bold text-white text-sm leading-tight truncate mt-0.5">{selectedPin.name}</h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-white text-xs">{selectedPin.rating || '5.0'}</span>
                  <span className="text-slate-400 text-[10px]">({selectedPin.totalReviews || 0})</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-white">{formatCurrency(selectedPin.pricePerDay)}/day</span>
                  <Link
                    to={`/vehicles/${selectedPin.id}`}
                    className="text-[10px] font-bold bg-accent text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700/60 backdrop-blur text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 pointer-events-none">
        <Map className="w-3.5 h-3.5 text-accent" />
        <span>LuxeWay Interactive Map Mapbox-Sim</span>
      </div>
    </div>
  );
};

// ====== FILTER PANEL ======
const FilterPanel: React.FC<{
  filters: VehicleFilters;
  onChange: (f: VehicleFilters) => void;
  brands: string[];
  onClose?: () => void;
}> = ({ filters, onChange, brands, onClose }) => {
  const t = useT();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice ?? 0,
    filters.maxPrice ?? 15000000,
  ]);

  useEffect(() => {
    setPriceRange([filters.minPrice ?? 0, filters.maxPrice ?? 15000000]);
  }, [filters.minPrice, filters.maxPrice]);

  const toggleCategory = (cat: VehicleCategory) => {
    const current = filters.category || [];
    const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
    onChange({ ...filters, category: next });
  };

  const toggleBrand = (brand: string) => {
    const current = filters.brands || [];
    const next = current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand];
    onChange({ ...filters, brands: next });
  };

  const clearAll = () => {
    setPriceRange([0, 15000000]);
    onChange({});
  };

  const hasFilters = Object.values(filters).some(v =>
    v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 pb-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-display font-bold text-foreground text-lg">{t.marketplace.filters}</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-accent hover:underline font-bold">
              {t.marketplace.clearFilters}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">{t.marketplace.category}</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => {
            const isSelected = (filters.category || []).includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 text-center",
                  isSelected
                    ? "border-accent bg-accent/10 text-accent font-extrabold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                )}
              >
                {(t.categories as any)[cat.labelKey] || cat.value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.marketplace.price}</p>
          <span className="text-xs font-bold text-foreground">
            {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">{t.marketplace.minPrice}</label>
            <input
              type="range"
              min={0}
              max={15000000}
              step={100000}
              value={priceRange[0]}
              onChange={e => {
                const val = Math.min(Number(e.target.value), priceRange[1] - 500000);
                setPriceRange([val, priceRange[1]]);
                onChange({ ...filters, minPrice: val > 0 ? val : undefined });
              }}
              className="w-full accent-accent h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">{t.marketplace.maxPrice}</label>
            <input
              type="range"
              min={0}
              max={15000000}
              step={100000}
              value={priceRange[1]}
              onChange={e => {
                const val = Math.max(Number(e.target.value), priceRange[0] + 500000);
                setPriceRange([priceRange[0], val]);
                onChange({ ...filters, maxPrice: val < 15000000 ? val : undefined });
              }}
              className="w-full accent-accent h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Specs Filters */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Transmission & Fuel</p>
        <div className="space-y-2">
          {/* Transmission */}
          <div className="flex gap-2">
            {['automatic', 'manual'].map((trans) => {
              const isSelected = (filters.transmission || []).includes(trans as any);
              return (
                <button
                  key={trans}
                  onClick={() => {
                    const current = filters.transmission || [];
                    const next = current.includes(trans as any) ? [] : [trans as any];
                    onChange({ ...filters, transmission: next });
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize",
                    isSelected
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {trans}
                </button>
              );
            })}
          </div>

          {/* Fuel Types */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['gasoline', 'diesel', 'electric', 'hybrid'].map((fuel) => {
              const isSelected = (filters.fuelType || []).includes(fuel as any);
              return (
                <button
                  key={fuel}
                  onClick={() => {
                    const current = filters.fuelType || [];
                    const next = current.includes(fuel as any) ? [] : [fuel as any];
                    onChange({ ...filters, fuelType: next });
                  }}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border transition-all capitalize",
                    isSelected
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400"
                  )}
                >
                  {fuel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brands check items */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">{t.marketplace.brand}</p>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {brands.map(brand => {
            const isChecked = (filters.brands || []).includes(brand);
            return (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBrand(brand)}
                  className="rounded text-accent accent-accent bg-transparent border-slate-350 dark:border-slate-700 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-foreground transition-colors">{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">{t.marketplace.rating}</p>
        <div className="flex gap-2">
          {[4.0, 4.5, 4.8].map(r => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? undefined : r })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200 ${filters.minRating === r ? 'border-amber-400 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Quick filters / Badges switches */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">{t.marketplace.quickFilters}</p>
        <div className="space-y-2.5">
          {[
            { key: 'instantBook', label: t.marketplace.instantBook },
            { key: 'verified', label: t.marketplace.verified },
            { key: 'deliveryAvailable', label: t.marketplace.delivery },
            { key: 'isFeatured', label: '⭐ Featured Exclusive' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!(filters as any)[f.key]}
                onChange={e => onChange({ ...filters, [f.key]: e.target.checked || undefined })}
                className="rounded text-accent accent-accent bg-transparent border-slate-350 dark:border-slate-700 w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-655 dark:text-slate-400 group-hover:text-foreground transition-colors">{f.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MAIN MARKETPLACE PAGE ======
const MarketplacePage: React.FC = () => {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Split layout layout state
  const [mapOpen, setMapOpen] = useState(true);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);

  // Read URL query values
  const [filters, setFilters] = useState<VehicleFilters>(() => {
    const location = searchParams.get('location') || undefined;
    const sortBy = (searchParams.get('sort') as VehicleFilters['sortBy']) || 'popular';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const categoryParams = searchParams.getAll('category');
    const category = categoryParams.length > 0
      ? categoryParams as VehicleCategory[]
      : (searchParams.get('category') ? [searchParams.get('category') as VehicleCategory] : undefined);

    const brandParams = searchParams.getAll('brand');
    const urlBrands = brandParams.length > 0
      ? brandParams.map(b => b.charAt(0).toUpperCase() + b.slice(1).toLowerCase())
      : undefined;

    return {
      location,
      category,
      brands: urlBrands,
      sortBy,
      startDate,
      endDate,
    };
  });

  const [brands, setBrands] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Load brands on mount
  useEffect(() => {
    setBrands(vehicleService.getBrands());
  }, []);

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
        setVehicles(results);
        setTotal(results.length);
        setTotalPages(1);
        setLoading(false);
      } else {
        loadVehicles(filters, page);
      }
    }, 400),
    [filters, page, loadVehicles]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      loadVehicles(filters, page);
    }
  }, [filters, page, searchQuery]);

  const handleFilterChange = (newFilters: VehicleFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSelectVehicleFromMap = (id: string) => {
    setSelectedVehicleId(id);
    const cardEl = document.getElementById(`vehicle-card-${id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHoveredVehicleId(id);
      setTimeout(() => setHoveredVehicleId(null), 1500);
    }
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (val === undefined || val === '' || key === 'sortBy') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Search Header Bar */}
      <div className="bg-card border-b border-slate-100 dark:border-slate-800 sticky top-20 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.marketplace.searchPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none text-foreground focus:border-accent focus:bg-white dark:focus:bg-slate-950 transition-all font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-200",
                showFilters
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{t.marketplace.filters}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-accent text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Sort controls */}
            <div className="relative">
              <select
                value={filters.sortBy || 'popular'}
                onChange={e => handleFilterChange({ ...filters, sortBy: e.target.value as VehicleFilters['sortBy'] })}
                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-655 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {(t.marketplace as any)[opt.labelKey] || opt.value}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* View grid/list switches */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 border border-slate-200/40 dark:border-slate-800/40">
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    viewMode === mode
                      ? "bg-white dark:bg-slate-800 shadow-sm text-foreground font-bold"
                      : "text-slate-450 hover:text-foreground"
                  )}
                >
                  {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Map Split Switch */}
            <button
              onClick={() => setMapOpen(!mapOpen)}
              className={cn(
                "hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all",
                mapOpen
                  ? "bg-accent/15 border-accent text-accent"
                  : "border-slate-200 dark:border-slate-800 text-slate-500"
              )}
            >
              <Map className="w-4 h-4" />
              <span>Map Split</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Advanced Filter Panel Sidebar (Desktop) */}
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
                  <FilterPanel
                    filters={filters}
                    onChange={handleFilterChange}
                    brands={brands}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Catalog Results Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-slate-450">
                {loading ? t.common.loading : (
                  <>
                    Found <span className="font-extrabold text-foreground">{total}</span> premium vehicles
                  </>
                )}
              </p>

              {filters.location && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5" />
                  {filters.location}
                  <button
                    onClick={() => handleFilterChange({ ...filters, location: undefined })}
                    className="ml-1 p-0.5 rounded-full hover:bg-accent/20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Catalog Grid of Cards */}
            {loading ? (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-6'
              )}>
                {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
              </div>
            ) : vehicles.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-center py-24 bg-card border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm"
              >
                <div className="text-7xl mb-4">🚗</div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">{t.marketplace.noResults}</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">{t.marketplace.noResultsHint}</p>
                <button onClick={() => { setFilters({}); setSearchQuery(''); }} className="btn-primary px-6 py-2.5">
                  {t.marketplace.clearFiltersBtn}
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    viewMode === 'grid'
                      ? mapOpen
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6'
                        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
                      : 'space-y-6'
                  )}
                >
                  {vehicles.map(vehicle => (
                    <motion.div
                      key={vehicle.id}
                      variants={staggerItem}
                      id={`vehicle-card-${vehicle.id}`}
                      onMouseEnter={() => setHoveredVehicleId(vehicle.id)}
                      onMouseLeave={() => setHoveredVehicleId(null)}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={cn(
                        "transition-all duration-300 rounded-3xl cursor-pointer",
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-11 h-11 rounded-2xl text-xs font-bold transition-all border",
                          page === p
                            ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                            : "bg-card border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Interactive Simulated Map (Sticky Desktop Split layout) */}
          <AnimatePresence>
            {mapOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: mapOpen ? '38%' : '0%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block w-[38%] h-[calc(100vh-230px)] sticky top-38 flex-shrink-0 z-30"
              >
                <VehicleMap
                  vehicles={vehicles}
                  selectedVehicleId={selectedVehicleId}
                  hoveredVehicleId={hoveredVehicleId || undefined}
                  onVehicleClick={(v: Vehicle) => handleSelectVehicleFromMap(v.id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Slide-out Filters Drawer (Mobile & Tablet) */}
      <AnimatePresence>
        {showFilters && (
          <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-card h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                brands={brands}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplacePage;
