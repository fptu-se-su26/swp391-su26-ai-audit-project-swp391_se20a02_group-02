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
import { useT } from '@/i18n/translations';

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
    filters.maxPrice ?? 15000,
  ]);

  // Sync priceRange when filters reset externally (e.g. clearAll)
  useEffect(() => {
    setPriceRange([filters.minPrice ?? 0, filters.maxPrice ?? 15000]);
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
    setPriceRange([0, 15000]);
    onChange({});
  };

  const hasFilters = Object.values(filters).some(v =>
    v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{t.marketplace.filters}</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-accent hover:text-blue-700 font-medium">
              {t.marketplace.clearFilters}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">{t.marketplace.category}</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200 ${
                (filters.category || []).includes(cat.value)
                  ? 'border-accent bg-blue-50 dark:bg-blue-900/30 text-accent'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {(t.categories as any)[cat.labelKey] || cat.value}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-foreground">{t.marketplace.price}</p>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t.marketplace.minPrice}</label>
            <input
              type="range"
              min={0}
              max={15000}
              step={100}
              value={priceRange[0]}
              onChange={e => {
                const val = Math.min(Number(e.target.value), priceRange[1] - 100);
                setPriceRange([val, priceRange[1]]);
                onChange({ ...filters, minPrice: val > 0 ? val : undefined });
              }}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t.marketplace.maxPrice}</label>
            <input
              type="range"
              min={0}
              max={15000}
              step={100}
              value={priceRange[1]}
              onChange={e => {
                const val = Math.max(Number(e.target.value), priceRange[0] + 100);
                setPriceRange([priceRange[0], val]);
                onChange({ ...filters, maxPrice: val < 15000 ? val : undefined });
              }}
              className="w-full accent-accent"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>$0</span>
            <span>$15,000</span>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">{t.marketplace.brand}</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.slice(0, 15).map(brand => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.brands || []).includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded accent-accent bg-transparent border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-foreground transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">{t.marketplace.rating}</p>
        <div className="flex gap-2">
          {[4, 4.5, 4.8].map(r => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? undefined : r })}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200 ${
                filters.minRating === r ? 'border-gold bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">{t.marketplace.quickFilters}</p>
        <div className="space-y-2">
          {[
            { key: 'instantBook', label: t.marketplace.instantBook },
            { key: 'verified', label: t.marketplace.verified },
            { key: 'deliveryAvailable', label: t.marketplace.delivery },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!(filters as any)[f.key]}
                onChange={e => onChange({ ...filters, [f.key]: e.target.checked || undefined })}
                className="rounded accent-accent bg-transparent border-slate-300 dark:border-slate-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-foreground">{f.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====== MARKETPLACE PAGE ======
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

  // Read ALL params from URL on mount
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

  // Auto-show filter sidebar if filters came from URL
  useEffect(() => {
    const hasPreFilter =
      searchParams.getAll('brand').length > 0 ||
      searchParams.getAll('category').length > 0;
    if (hasPreFilter) setShowFilters(true);
  }, []);

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
    <div className="min-h-screen bg-background pt-20">
      {/* Top Bar */}
      <div className="bg-card border-b border-slate-100 dark:border-slate-800 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.marketplace.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-foreground focus:border-accent focus:bg-white dark:focus:bg-slate-900 transition-all"
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
                className="appearance-none pl-4 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-foreground cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {(t.marketplace as any)[opt.labelKey] || opt.value}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                showFilters
                  ? 'border-accent bg-blue-50 dark:bg-blue-900/30 text-accent'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t.marketplace.filters}
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === mode ? 'bg-white dark:bg-slate-750 shadow-sm text-foreground' : 'text-slate-400'
                  }`}
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
                <div className="w-[280px] bg-card rounded-3xl border border-slate-100 dark:border-slate-800 p-5 sticky top-36 shadow-sm">
                  <FilterPanel filters={filters} onChange={handleFilterChange} brands={brands} onClose={() => setShowFilters(false)} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {loading ? t.common.loading : (
                  <>
                    <span className="font-semibold text-foreground">{total}</span> {t.marketplace.vehicles}
                  </>
                )}
              </p>
              {filters.location && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
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
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">{t.marketplace.noResults}</h3>
                <p className="text-muted-foreground mb-6">{t.marketplace.noResultsHint}</p>
                <button onClick={() => { setFilters({}); setSearchQuery(''); }} className="btn-primary">
                  {t.marketplace.clearFiltersBtn}
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
                          page === p
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-card border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-350'
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
