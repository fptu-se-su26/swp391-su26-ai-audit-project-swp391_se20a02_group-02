import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown,
  MapPin, Sparkles, ArrowUpDown
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import type { Vehicle, VehicleFilters, VehicleCategory } from '@/types';
import { formatCurrency, debounce } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';

const CATEGORIES: { value: VehicleCategory; label: string }[] = [
  { value: 'supercar', label: 'Supercars' },
  { value: 'suv', label: 'Luxury SUVs' },
  { value: 'luxury', label: 'Ultra Luxury' },
  { value: 'convertible', label: 'Convertibles' },
  { value: 'classic', label: 'Classics' },
  { value: 'electric', label: 'Electric' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

// ====== FILTER PANEL ======
const FilterPanel: React.FC<{
  filters: VehicleFilters;
  onChange: (f: VehicleFilters) => void;
  brands: string[];
  onClose?: () => void;
}> = ({ filters, onChange, brands, onClose }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 15000,
  ]);

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

  const clearAll = () => onChange({});

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#0F172A]">Filters</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-accent hover:text-blue-700 font-medium">
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Category</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200 ${
                (filters.category || []).includes(cat.value)
                  ? 'border-accent bg-blue-50 text-accent'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-[#0F172A]">Price / Day</p>
          <span className="text-xs text-slate-500">
            {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={15000}
            step={100}
            value={priceRange[1]}
            onChange={e => {
              const val = Number(e.target.value);
              setPriceRange([priceRange[0], val]);
              onChange({ ...filters, maxPrice: val });
            }}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>$0</span>
            <span>$15,000</span>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Brand</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.slice(0, 15).map(brand => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.brands || []).includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded accent-accent"
              />
              <span className="text-sm text-slate-600 group-hover:text-[#0F172A] transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Minimum Rating</p>
        <div className="flex gap-2">
          {[4, 4.5, 4.8].map(r => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? undefined : r })}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200 ${
                filters.minRating === r ? 'border-gold bg-yellow-50 text-yellow-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Quick Filters</p>
        <div className="space-y-2">
          {[
            { key: 'instantBook', label: '⚡ Instant Book' },
            { key: 'verified', label: '✓ Verified Only' },
            { key: 'deliveryAvailable', label: '🚚 Delivery Available' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!(filters as any)[f.key]}
                onChange={e => onChange({ ...filters, [f.key]: e.target.checked || undefined })}
                className="rounded accent-accent"
              />
              <span className="text-sm text-slate-600 group-hover:text-[#0F172A]">{f.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MARKETPLACE PAGE ======
const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<VehicleFilters>({
    location: searchParams.get('location') || undefined,
    category: searchParams.get('category') ? [searchParams.get('category') as VehicleCategory] : undefined,
    sortBy: (searchParams.get('sort') as VehicleFilters['sortBy']) || 'popular',
  });
  const [brands, setBrands] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

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

  // Debounced search
  const debouncedSearch = useCallback(debounce(async (q: string) => {
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
  }, 400), [filters, page, loadVehicles]);

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

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== 'popular' && (Array.isArray(v) ? v.length > 0 : true)).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vehicles, brands, cities..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-accent focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={filters.sortBy || 'popular'}
                onChange={e => handleFilterChange({ ...filters, sortBy: e.target.value as VehicleFilters['sortBy'] })}
                className="appearance-none pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${showFilters ? 'border-accent bg-blue-50 text-accent' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-400'}`}
                >
                  {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters (Desktop) */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block flex-shrink-0 overflow-hidden"
              >
                <div className="w-[280px] bg-white rounded-3xl border border-slate-100 p-5 sticky top-36">
                  <FilterPanel filters={filters} onChange={handleFilterChange} brands={brands} onClose={() => setShowFilters(false)} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                {loading ? 'Loading...' : (
                  <><span className="font-semibold text-[#0F172A]">{total}</span> vehicles found</>
                )}
              </p>
              {filters.location && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {filters.location}
                  <button onClick={() => handleFilterChange({ ...filters, location: undefined })} className="ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Vehicle Grid */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
                {Array.from({ length: 9 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
              </div>
            ) : vehicles.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-2">No vehicles found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or searching in a different location.</p>
                <button onClick={() => { setFilters({}); setSearchQuery(''); }} className="btn-primary">
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                    : 'space-y-4'}
                >
                  {vehicles.map(vehicle => (
                    <motion.div key={vehicle.id} variants={staggerItem}>
                      <VehicleCard vehicle={vehicle} variant={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          page === p ? 'bg-[#0F172A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
