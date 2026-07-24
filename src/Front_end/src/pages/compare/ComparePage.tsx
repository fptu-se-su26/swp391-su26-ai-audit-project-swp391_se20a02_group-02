import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, X, ArrowRight, Star, MapPin, Check, Minus } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types';
import { formatCurrency } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { useT } from '@/i18n/translations';
import { useVehicleStore } from '@/store';

const MAX_COMPARE = 3;

const getEngineDescription = (vehicle: Vehicle) => {
  if (vehicle.engineCc) return `${vehicle.engineCc} cc`;
  if (vehicle.specs?.engineSize) return vehicle.specs.engineSize;
  if (vehicle.specs?.horsepower) return `${vehicle.specs.horsepower} HP`;
  return vehicle.specs?.fuelType || undefined;
};

const SpecRow: React.FC<{ label: string; values: (string | number | boolean | undefined)[] }> = ({ label, values }) => {
  const format = (v: string | number | boolean | undefined) => {
    if (v === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
    if (v === false || v === undefined || v === null) return <Minus className="w-4 h-4 text-slate-300 mx-auto" />;
    return <span>{v}</span>;
  };

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
      <td className="py-3 pr-4 text-sm font-medium text-slate-500 whitespace-nowrap w-36">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="py-3 px-4 text-sm text-slate-800 dark:text-slate-200 text-center">
          {format(v)}
        </td>
      ))}
      {/* Empty cells for unfilled slots */}
      {Array.from({ length: MAX_COMPARE - values.length }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3 px-4 text-center">
          <Minus className="w-4 h-4 text-slate-200 dark:text-slate-700 mx-auto" />
        </td>
      ))}
    </tr>
  );
};

const PriceComparisonRow: React.FC<{ label: string; vehicles: Vehicle[] }> = ({ label, vehicles }) => {
  const lowest = Math.min(...vehicles.map(vehicle => Number(vehicle.pricePerDay)));
  return (
    <tr className="border-b border-blue-100 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20">
      <td className="py-4 pr-4 text-sm font-bold text-blue-700 dark:text-blue-300">{label}</td>
      {vehicles.map(vehicle => {
        const isBest = Number(vehicle.pricePerDay) === lowest;
        return (
          <td key={vehicle.id} className="px-4 py-4 text-center">
            <div className={isBest ? 'rounded-xl bg-emerald-100 px-3 py-2 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300' : ''}>
              <div className="font-black">{formatCurrency(vehicle.pricePerDay)}</div>
              {isBest && <div className="mt-1 text-[10px] font-bold uppercase">Best price</div>}
            </div>
          </td>
        );
      })}
      {Array.from({ length: MAX_COMPARE - vehicles.length }).map((_, index) => <td key={index} />)}
    </tr>
  );
};
const VehicleSlot: React.FC<{
  vehicle: Vehicle | null;
  index: number;
  onRemove: () => void;
  onAdd: () => void;
}> = ({ vehicle, index, onRemove, onAdd }) => {
  const t = useT();
  if (!vehicle) {
    return (
      <div className="flex-1 min-w-0">
        <button
          onClick={onAdd}
          className="w-full h-56 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-accent hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 flex flex-col items-center justify-center gap-3 group bg-white dark:bg-slate-900"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <span className="text-sm font-medium text-slate-400 group-hover:text-accent transition-colors">
            {t.compare.addVehicle} {index + 1}
          </span>
        </button>
      </div>
    );
  }

  const image = vehicle.images?.[0] ?? 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400';

  return (
    <motion.div variants={staggerItem} className="flex-1 min-w-0">
      <div className="relative group luxury-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 z-20 w-7 h-7 bg-white dark:bg-slate-800 shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="relative h-44 overflow-hidden rounded-2xl mb-4">
          <img src={image} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {vehicle.isFeatured && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-gold text-[#0F172A] text-[10px] font-bold rounded-full">
              {t.compare.featured}
            </span>
          )}
        </div>
        <div className="px-1">
          <p className="text-xs font-semibold text-accent mb-1">{vehicle.brand}</p>
          <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white leading-tight mb-2 truncate">{vehicle.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <MapPin className="w-3 h-3" />
            <span>{vehicle.location?.city || 'Vietnam'}</span>
            <span className="mx-1">•</span>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{vehicle.rating?.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-[#0F172A] dark:text-white">{formatCurrency(vehicle.pricePerDay)}</span>
              <span className="text-xs text-slate-400">{t.marketplace.perDay}</span>
            </div>
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-blue-700 transition-colors"
            >
              {t.common.view} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VehiclePicker: React.FC<{
  onSelect: (v: Vehicle) => void;
  onClose: () => void;
  excluded: string[];
}> = ({ onSelect, onClose, excluded }) => {
  const t = useT();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await vehicleService.getAll({}, 1, 20);
      setResults(res.data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = results.filter(v =>
    !excluded.includes(v.id) &&
    (v.name.toLowerCase().includes(query.toLowerCase()) ||
     v.brand.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg luxury-card p-6 max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-white">{t.compare.selectVehicle}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t.compare.searchPlaceholder}
          className="lux-input mb-4"
          autoFocus
        />
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-8">{t.compare.noVehiclesFound}</p>
          ) : (
            filtered.map(v => (
              <button
                key={v.id}
                onClick={() => { onSelect(v); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-slate-100 dark:border-slate-800 hover:border-accent/30 transition-all text-left"
              >
                <img
                  src={v.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=80'}
                  alt={v.name}
                  className="w-14 h-10 object-cover rounded-xl flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{v.name}</p>
                  <p className="text-xs text-slate-500">{v.brand} • {formatCurrency(v.pricePerDay)}{t.marketplace.perDay}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ComparePage: React.FC = () => {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { compareList, setCompareList } = useVehicleStore();
  const [vehicles, setVehicles] = useState<(Vehicle | null)[]>([null, null, null]);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  // URL initializes the selection once; afterwards the store is the single source of truth.
  useEffect(() => {
    const urlIds = searchParams.get('ids')?.split(',').filter(Boolean).slice(0, MAX_COMPARE) || [];
    if (urlIds.length > 0) setCompareList(urlIds);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const ids = compareList.slice(0, MAX_COMPARE);
    setSearchParams(ids.length ? { ids: ids.join(',') } : {}, { replace: true });

    if (ids.length === 0) {
      setVehicles([null, null, null]);
      return;
    }

    let active = true;
    Promise.all(ids.map(id => vehicleService.getById(id))).then(loaded => {
      if (!active) return;
      const valid = loaded.filter(Boolean) as Vehicle[];
      const validIds = valid.map(vehicle => vehicle.id);
      if (validIds.length !== ids.length) setCompareList(validIds);
      const slots: (Vehicle | null)[] = [...valid];
      while (slots.length < MAX_COMPARE) slots.push(null);
      setVehicles(slots);
    });
    return () => { active = false; };
  }, [compareList, initialized, setCompareList, setSearchParams]);

  const addVehicle = (index: number, vehicle: Vehicle) => {
    const next = [...compareList];
    next[index] = vehicle.id;
    setCompareList(next);
  };

  const removeVehicle = (index: number) => {
    const id = vehicles[index]?.id;
    if (!id) return;
    setCompareList(compareList.filter(vehicleId => vehicleId !== id));
  };

  const filled = vehicles.filter(Boolean) as Vehicle[];
  const excludedIds = filled.map(v => v.id);

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#070B14] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <span className="text-label text-gold mb-2 block">{t.compare.sideBySide}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] dark:text-white mb-3">
            {t.compare.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
            {t.compare.subtitle}
          </p>
        </motion.div>

        {/* Vehicle Slots */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row gap-4 mb-10"
        >
          {vehicles.map((v, i) => (
            <VehicleSlot
              key={i}
              vehicle={v}
              index={i}
              onRemove={() => removeVehicle(i)}
              onAdd={() => setPickerIndex(i)}
            />
          ))}
        </motion.div>

        {/* Comparison Table */}
        {filled.length >= 2 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="luxury-card p-6 overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800"
          >
            <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-white mb-6">{t.compare.specComparison}</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="py-3 text-left text-sm font-semibold text-slate-400 w-36">{t.compare.spec}</th>
                  {filled.map(v => (
                    <th key={v.id} className="py-3 px-4 text-center text-sm font-bold text-[#0F172A] dark:text-white">
                      {v.name}
                    </th>
                  ))}
                  {Array.from({ length: MAX_COMPARE - filled.length }).map((_, i) => (
                    <th key={i} className="py-3 px-4" />
                  ))}
                </tr>
              </thead>
              <tbody>
                <PriceComparisonRow label={t.compare.priceDay} vehicles={filled} />
                <SpecRow label="Deposit" values={filled.map(v => formatCurrency(v.deposit || 0))} />
                <SpecRow label={t.compare.category} values={filled.map(v => v.category)} />
                <SpecRow label={t.compare.brand} values={filled.map(v => v.brand)} />
                <SpecRow label={t.compare.seats} values={filled.map(v => v.specs?.seats)} />
                <SpecRow label={t.compare.transmission} values={filled.map(v => v.specs?.transmission)} />
                <SpecRow label={t.compare.engine} values={filled.map(getEngineDescription)} />
                <SpecRow label={t.compare.fuelType} values={filled.map(v => v.specs?.fuelType)} />
                <SpecRow label={t.compare.rating} values={filled.map(v => v.rating?.toFixed(1))} />
                <SpecRow label={t.compare.reviews} values={filled.map(v => v.totalReviews)} />
                <SpecRow label={t.compare.instantBook} values={filled.map(v => v.instantBook)} />
                <SpecRow label={t.compare.delivery} values={filled.map(v => v.deliveryAvailable)} />
                <SpecRow label={t.compare.location} values={filled.map(v => v.location?.city)} />
              </tbody>
            </table>

            {/* Book CTA */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              {filled.map(v => (
                <div key={v.id} className="flex-1">
                  <Link
                    to={`/booking/${v.id}`}
                    className="btn-primary w-full text-center block py-3 text-sm"
                  >
                    {t.compare.bookCar.replace('{name}', v.name.split(' ')[0])}
                  </Link>
                </div>
              ))}
              {Array.from({ length: MAX_COMPARE - filled.length }).map((_, i) => (
                <div key={i} className="flex-1" />
              ))}
            </div>
          </motion.div>
        )}

        {filled.length < 2 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t.compare.addAtLeast2}</p>
            <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2 mt-6">
              {t.compare.browseVehicles} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Picker Modal */}
      {pickerIndex !== null && (
        <VehiclePicker
          onSelect={v => addVehicle(pickerIndex, v)}
          onClose={() => setPickerIndex(null)}
          excluded={excludedIds}
        />
      )}
    </div>
  );
};

export default ComparePage;
