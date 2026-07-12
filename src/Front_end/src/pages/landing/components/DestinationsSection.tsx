import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Destination } from '@/services/homeService';
import { formatCurrency } from '@/utils';

// ── Real city photos from /src/image folder ────────────────────────────────────────────
import imgHCM from '../../../image/city-hochiminh.jpg';
import imgHaNoi from '../../../image/city-hanoi.jpg';
import imgDaNang from '../../../image/city-danang.jpg';
import imgNhaTrang from '../../../image/city-nhatrang.jpg';
import imgDaLat from '../../../image/city-dalat.jpg';
import imgHue from '../../../image/city-hue.jpg';

// Helper to resolve clean ASCII city keys from any string (including database question marks)
function getCityKey(city: string): string {
  const norm = (city || '').toLowerCase().trim();
  if (norm.includes('h') && norm.includes('ch') && norm.includes('m')) return 'hcm';
  if (norm.includes('nội') || norm.includes('n?i') || norm.includes('hanoi') || norm.includes('ha noi')) return 'hanoi';
  if (norm.includes('nẵng') || norm.includes('n?ng') || norm.includes('danang') || norm.includes('da nang')) return 'danang';
  if (norm.includes('nha trang') || norm.includes('nhatrang')) return 'nhatrang';
  if (norm.includes('lạt') || norm.includes('l?t') || norm.includes('dalat') || norm.includes('da lat')) return 'dalat';
  if (norm.includes('huế') || norm.includes('hu?') || norm.includes('hue')) return 'hue';
  return '';
}

const CITY_IMAGES: Record<string, string> = {
  hcm: imgHCM,
  hanoi: imgHaNoi,
  danang: imgDaNang,
  nhatrang: imgNhaTrang,
  dalat: imgDaLat,
  hue: imgHue,
};

const CITY_DISPLAY_NAMES: Record<string, string> = {
  hcm: 'TP. Hồ Chí Minh',
  hanoi: 'Hà Nội',
  danang: 'Đà Nẵng',
  nhatrang: 'Nha Trang',
  dalat: 'Đà Lạt',
  hue: 'Huế',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-[2rem] ${className}`} />
);

interface DestinationsSectionProps {
  destinations: Destination[];
  loading: boolean;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({ destinations, loading }) => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">Điểm Đến Hàng Đầu</span>
            <h2 className="font-bold text-3xl md:text-5xl text-slate-900 dark:text-white">Bạn muốn đi đâu? 🗺️</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-450 flex items-center gap-1.5 transition-colors">
            Tất cả thành phố <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {(loading ? Array(6).fill(null) : destinations).map((dest, i) => {
            const key = dest ? getCityKey(dest.city) : '';
            const displayImg = key ? CITY_IMAGES[key] : (dest?.imageUrl || '');
            const displayName = key ? CITY_DISPLAY_NAMES[key] : (dest?.city || '');
            return (
              <motion.div key={dest?.city ?? i} variants={staggerItem}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', damping: 18 }}
                className="relative rounded-[2rem] overflow-hidden h-80 cursor-pointer group shadow-lg hover:shadow-2xl border border-slate-100/10 dark:border-slate-800/80 bg-slate-950 transition-all duration-300"
                onClick={() => dest && navigate(`/marketplace?location=${encodeURIComponent(dest.city)}`)}>
                {dest ? (
                  <>
                    <img
                      src={displayImg}
                      alt={displayName}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-extrabold text-white text-base md:text-lg mb-1 leading-tight group-hover:text-amber-400 transition-colors">{displayName}</p>
                      <p className="text-slate-300 text-xs font-semibold">{dest.vehicleCount} xe có sẵn</p>
                      <span className="inline-block mt-2.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/25">
                        Từ {formatCurrency(dest.averagePrice)}/ngày
                      </span>
                    </div>
                  </>
                ) : <Skeleton className="w-full h-full" />}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationsSection;
