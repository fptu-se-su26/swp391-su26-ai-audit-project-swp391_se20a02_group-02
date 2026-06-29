import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, MapPin, Calendar, DollarSign, Star, 
  Car, Bike, Navigation, Loader2, ArrowRight, X, Heart, Menu
} from 'lucide-react';
import { LuxeWayMap } from '@/components/map/LuxeWayMap';
import { vehicleService } from '@/services/vehicleService';
import { useUIStore } from '@/store';
import type { Vehicle, VehicleFilters, VehicleLocationResponse } from '@/types';
import { formatCurrency, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';

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
  'vũng tàu': { lat: 10.3458, lng: 107.0843 },
  'vung tau': { lat: 10.3458, lng: 107.0843 },
};

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  // Search & Filter state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [locationText, setLocationText] = useState(searchParams.get('location') || 'Ho Chi Minh');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorbike' | ''>(
    (searchParams.get('type')?.toLowerCase() as 'car' | 'motorbike') || ''
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [minRating, setMinRating] = useState<number>(0);
  
  // Quick filters states
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [fiveStarHost, setFiveStarHost] = useState(false);
  const [instantBook, setInstantBook] = useState(false);
  const [noDeposit, setNoDeposit] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [showListMode, setShowListMode] = useState(false);

  // Data state
  const [vehicles, setVehicles] = useState<VehicleLocationResponse[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Active Dropdowns
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'brand' | 'price' | 'rating' | null>(null);

  // Auto detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation access denied, using default city center.', error);
        }
      );
    }
  }, []);

  // Fetch vehicles with active filters
  const fetchMapVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const filters: VehicleFilters = {
        keyword: keyword || undefined,
        location: locationText || undefined,
        vehicleType: vehicleType || undefined,
        brands: selectedBrand ? [selectedBrand] : undefined,
        maxPrice: maxPrice < 10000000 ? maxPrice : undefined,
        minRating: fiveStarHost ? 4.8 : (minRating > 0 ? minRating : undefined),
        instantBook: instantBook ? true : undefined,
        deliveryAvailable: deliveryAvailable ? true : undefined,
        userLat: userCoords?.lat,
        userLng: userCoords?.lng,
      };
      
      const response = await vehicleService.getMapVehicles(filters);
      let filtered = response || [];
      
      // Client-side fallback checks for local-only filter properties
      if (noDeposit) {
        filtered = filtered.filter(v => !v.discount || v.discount >= 0); // fallback or zero deposit mock matching
      }
      if (hasDiscount) {
        filtered = filtered.filter(v => v.discount > 0);
      }
      
      setVehicles(filtered);
    } catch (err) {
      console.error('Failed to load map vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, locationText, vehicleType, selectedBrand, maxPrice, minRating, userCoords, deliveryAvailable, fiveStarHost, instantBook, noDeposit, hasDiscount]);

  useEffect(() => {
    fetchMapVehicles();
  }, [fetchMapVehicles]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLoc = locationText.toLowerCase().trim();
    if (GEOCODE_DATABASE[cleanLoc]) {
      const target = GEOCODE_DATABASE[cleanLoc];
      if ((window as any).luxewayMapInstance) {
        (window as any).luxewayMapInstance.flyTo({
          center: [target.lng, target.lat],
          zoom: 13,
          essential: true
        });
      }
    }
    fetchMapVehicles();
  };

  // Toggle active filter dropdowns
  const toggleDropdown = (dropdown: 'type' | 'brand' | 'price' | 'rating') => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-[#090D1A] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      
      {/* Top Filter Bar */}
      <div className="pt-20 pb-3 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F172A] border-b border-slate-200/65 dark:border-slate-800/80 shadow-sm z-35 transition-colors">
        <div className="max-w-7xl mx-auto space-y-3">
          
          {/* Row 1: Search Inputs & Date range */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleLocationSubmit} className="flex flex-wrap flex-1 w-full gap-2 items-center">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <input
                  type="text"
                  value={locationText}
                  onChange={e => setLocationText(e.target.value)}
                  placeholder="Điểm đón xe (Thành phố, địa chỉ...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-850 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                />
              </div>

              {/* Time display indicator styled as datepicker range */}
              <div className="relative flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>21:00 T2, 29/06 - 20:00 T3, 30/06</span>
              </div>

              <div className="relative flex-1 min-w-[150px] max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Tên xe, từ khóa..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-850 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                />
              </div>

              <button 
                type="submit" 
                className="py-2.5 px-6 bg-[#0B1221] dark:bg-white text-white dark:text-[#0B1221] hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tìm kiếm'}
              </button>
            </form>
          </div>

          {/* Row 2: Quick filters scroll row */}
          <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-none select-none">
            
            {/* 1. Loại xe (Type) */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => toggleDropdown('type')}
                className={cn(
                  "px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border text-xs font-bold rounded-full flex items-center gap-1.5 transition-all",
                  vehicleType ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350"
                )}
              >
                <span>Loại xe: {vehicleType === 'car' ? 'Ô tô' : vehicleType === 'motorbike' ? 'Xe máy' : 'Tất cả'}</span>
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'type' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-800/80 rounded-2xl shadow-xl p-2 z-55"
                  >
                    {[
                      { key: '', label: 'Tất cả các loại' },
                      { key: 'car', label: 'Chỉ xe Ô tô' },
                      { key: 'motorbike', label: 'Chỉ xe Máy' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setVehicleType(opt.key as any);
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                          vehicleType === opt.key ? "bg-[#D4AF37]/10 text-[#D4AF37] font-extrabold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Hãng xe (Brand) */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => toggleDropdown('brand')}
                className={cn(
                  "px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border text-xs font-bold rounded-full flex items-center gap-1.5 transition-all",
                  selectedBrand ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-355"
                )}
              >
                <span>Hãng xe: {selectedBrand || 'Tất cả'}</span>
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'brand' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-800/80 rounded-2xl shadow-xl p-2 z-55 max-h-60 overflow-y-auto"
                  >
                    <button 
                      onClick={() => { setSelectedBrand(''); setActiveDropdown(null); }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Tất cả các hãng
                    </button>
                    {['Toyota', 'VinFast', 'Ford', 'Honda', 'Yamaha', 'BMW', 'Mercedes-Benz', 'Audi'].map(b => (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBrand(b);
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                          selectedBrand === b ? "bg-[#D4AF37]/10 text-[#D4AF37] font-extrabold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Giao nhận tận nơi toggle */}
            <button
              onClick={() => setDeliveryAvailable(!deliveryAvailable)}
              className={cn(
                "px-4 py-2.5 border text-xs font-bold rounded-full transition-all flex-shrink-0",
                deliveryAvailable ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              )}
            >
              Giao xe tận nơi
            </button>

            {/* 4. Chủ xe 5★ toggle */}
            <button
              onClick={() => setFiveStarHost(!fiveStarHost)}
              className={cn(
                "px-4 py-2.5 border text-xs font-bold rounded-full transition-all flex-shrink-0",
                fiveStarHost ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              )}
            >
              Chủ xe 5★
            </button>

            {/* 5. Đặt xe nhanh toggle */}
            <button
              onClick={() => setInstantBook(!instantBook)}
              className={cn(
                "px-4 py-2.5 border text-xs font-bold rounded-full transition-all flex-shrink-0",
                instantBook ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              )}
            >
              Đặt xe nhanh
            </button>

            {/* 6. Miễn thế chấp toggle */}
            <button
              onClick={() => setNoDeposit(!noDeposit)}
              className={cn(
                "px-4 py-2.5 border text-xs font-bold rounded-full transition-all flex-shrink-0",
                noDeposit ? "border-emerald-500 text-emerald-600 dark:text-emerald-450 bg-emerald-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              )}
            >
              Miễn thế chấp
            </button>

            {/* 7. Giảm giá toggle */}
            <button
              onClick={() => setHasDiscount(!hasDiscount)}
              className={cn(
                "px-4 py-2.5 border text-xs font-bold rounded-full transition-all flex-shrink-0",
                hasDiscount ? "border-red-500 text-red-600 dark:text-red-405 bg-red-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              )}
            >
              Giảm giá %
            </button>

            {/* 8. Bộ lọc (Price slider toggler) */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => toggleDropdown('price')}
                className={cn(
                  "px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border text-xs font-bold rounded-full flex items-center gap-1.5 transition-all",
                  maxPrice < 10000000 ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bộ lọc: {maxPrice < 10000000 ? `< ${(maxPrice/1000).toLocaleString()}K` : 'Mọi mức giá'}</span>
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'price' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-800/80 rounded-2xl shadow-xl p-4 z-55"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Ngân sách / Ngày</span>
                      <span className="text-xs font-bold text-[#D4AF37]">{formatCurrency(maxPrice)}</span>
                    </div>
                    <input 
                      type="range" 
                      min={200000} 
                      max={10000000} 
                      step={100000}
                      value={maxPrice} 
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-bold">
                      <span>200K</span>
                      <span>5M</span>
                      <span>10M+</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Vehicle count badge ─── */}
            <div className="ml-auto flex-shrink-0 flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              {loading ? (
                <span className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-full text-[11px] font-bold text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang tìm...
                </span>
              ) : (
                <span className="px-3 py-2 bg-[#0B1221] dark:bg-white text-white dark:text-[#0B1221] rounded-full text-[11px] font-black tabular-nums">
                  {vehicles.length} xe
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Map Content Body */}
      <div className="flex-1 flex w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
        
        {/* VIEW 1: Grid of Vehicles (List Mode) */}
        {showListMode ? (
          <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#090D1A] transition-colors relative">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-display font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">
                  Tìm thấy {vehicles.length} xe theo yêu cầu
                </h2>
                {loading && <Loader2 className="w-5 h-5 animate-spin text-amber-500" />}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                {vehicles.map(v => {
                  const thumbnailSrc = v.thumbnail || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                  
                  const pricePerDay = v.pricePerDay;
                  const displayPrice = pricePerDay >= 1000 
                    ? `${(pricePerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`
                    : `${pricePerDay}`;
                  
                  const originalPrice = v.discount > 0 ? (pricePerDay / (1 - v.discount / 100)) : pricePerDay;
                  const displayOriginalPrice = originalPrice >= 1000 
                    ? `${(originalPrice / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`
                    : `${originalPrice.toFixed(0)}`;
                    
                  const discountPercent = v.discount || 0;
                  const targetPath = v.type?.toLowerCase() === 'motorbike' ? `/motorbikes/${v.id}` : `/cars/${v.id}`;
                  
                  return (
                    <div 
                      key={v.id}
                      onClick={() => navigate(targetPath)}
                      className="group bg-white dark:bg-[#131F35] rounded-3xl border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D4AF37]/35 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                        <img 
                          src={thumbnailSrc} 
                          alt={v.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Overlay badges matching Mioto layout */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 select-none">
                          {discountPercent > 0 && (
                            <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                              Giảm {discountPercent}%
                            </span>
                          )}
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                            Miễn thế chấp
                          </span>
                          <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                            Giao xe tận nơi
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-white truncate uppercase tracking-tight">
                            {v.brand} {v.name.replace(new RegExp('^' + v.brand, 'i'), '').trim()}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-450 dark:text-slate-400 mt-1 font-bold">
                            <span>Số tự động</span>
                            <span>•</span>
                            <span>{v.type?.toLowerCase() === 'motorbike' ? '2 chỗ' : '5 chỗ'}</span>
                            <span>•</span>
                            <span>Xăng</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 mt-2 truncate">
                            📍 {v.address || 'Hồ Chí Minh'}
                          </p>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-[#D4AF37] font-bold">★</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">{Number(v.rating || 5.0).toFixed(1)}</span>
                            <span className="text-slate-450">({v.totalTrips || 12} chuyến)</span>
                          </div>
                          
                          <div className="text-right">
                            {discountPercent > 0 && (
                              <p className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                                {displayOriginalPrice}
                              </p>
                            )}
                            <p className="font-display font-black text-[#0B1221] dark:text-white leading-none">
                              <span className="text-base text-amber-500">{displayPrice}</span>
                              <span className="text-[9px] text-slate-450 font-bold font-sans">/ngày</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!loading && vehicles.length === 0 && (
                <div className="text-center py-24 bg-white dark:bg-[#131F35] rounded-3xl border border-slate-150 dark:border-slate-800 p-8 shadow-sm">
                  <span className="text-5xl block mb-2">🚗</span>
                  <h3 className="text-lg font-bold text-foreground mb-1">Không tìm thấy xe</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">Vui lòng thay đổi bộ lọc, giảm ngân sách hoặc đổi khu vực tìm kiếm.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          
          /* VIEW 2: Full Screen Map (Map Mode) */
          <div className="flex-1 h-full w-full relative z-10">
            <LuxeWayMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicle?.id}
              onVehicleClick={v => setSelectedVehicle(v)}
              onSelectionChange={list => {
                if (list && list.length > 0) {
                  setSelectedVehicle(list[0]);
                }
              }}
            />

            {/* Selected Vehicle Floating Panel (Overlay Map) */}
            <AnimatePresence>
              {selectedVehicle && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="absolute bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-20 flex gap-4 transition-colors"
                >
                  <div className="w-24 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={selectedVehicle.thumbnail || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
                      alt={selectedVehicle.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-850 dark:text-white truncate uppercase tracking-tight">
                        {selectedVehicle.brand} {selectedVehicle.name.replace(new RegExp('^' + selectedVehicle.brand, 'i'), '').trim()}
                      </h4>
                      <p className="text-[11px] font-bold text-amber-500 mt-1 flex items-center gap-1">
                        ★ {Number(selectedVehicle.rating || 5.0).toFixed(1)} 
                        <span className="text-slate-400 font-normal">({selectedVehicle.totalReviews || selectedVehicle.totalTrips || 12} chuyến)</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">
                        {(selectedVehicle.pricePerDay >= 1000 ? `${(selectedVehicle.pricePerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K` : selectedVehicle.pricePerDay)}/ngày
                      </span>
                      <button
                        onClick={() => {
                          const typePath = selectedVehicle.vehicleType?.toLowerCase() === 'motorbike' || selectedVehicle.type?.toLowerCase() === 'motorbike' ? 'motorbikes' : 'cars';
                          navigate(`/${typePath}/${selectedVehicle.id}`);
                        }}
                        className="px-3.5 py-1.5 bg-[#0B1221] dark:bg-white text-white dark:text-[#0B1221] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-white transition-all shadow-sm"
                      >
                        Thuê ngay
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedVehicle(null)}
                    className="absolute top-2.5 right-2.5 p-1 bg-slate-50 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full"
                  >
                    <X className="w-3.5 h-3.5 text-slate-450" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* FLOATING VIEW MODE SWITCHER (Absolute bottom center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
          <button
            onClick={() => setShowListMode(!showListMode)}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#0B1221] text-white hover:bg-[#D4AF37] hover:scale-105 active:scale-95 text-xs font-extrabold uppercase tracking-widest rounded-full shadow-2xl transition-all border border-white/10"
          >
            {showListMode ? (
              <>
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Bản đồ 🗺</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4 text-[#D4AF37]" />
                <span>Danh sách ☰</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MapPage;
