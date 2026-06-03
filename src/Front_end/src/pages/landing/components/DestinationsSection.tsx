import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Destination } from '@/services/homeService';
import { formatCurrency } from '@/utils';

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
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

interface DestinationsSectionProps {
  destinations: Destination[];
  loading: boolean;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({ destinations, loading }) => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">Top Destinations</span>
            <h2 className="font-bold text-3xl md:text-5xl text-[#0F172A]">Where Do You Want to Go?</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-semibold text-slate-500 hover:text-[#0F172A] flex items-center gap-1 transition-colors">
            All Cities <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {(loading ? Array(6).fill(null) : destinations).map((dest, i) => (
            <motion.div key={dest?.city ?? i} variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', damping: 18 }}
              className="relative rounded-2xl overflow-hidden h-80 cursor-pointer group shadow-md hover:shadow-2xl transition-all"
              onClick={() => dest && navigate(`/marketplace?location=${encodeURIComponent(dest.city)}`)}>
              {dest ? (
                <>
                  <img src={dest.imageUrl} alt={dest.city} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-extrabold text-white text-base md:text-lg mb-1 leading-tight">{dest.city}</p>
                    <p className="text-white/70 text-xs font-medium">{dest.vehicleCount} vehicles</p>
                    <p className="text-amber-400 text-xs font-bold mt-1">from {formatCurrency(dest.averagePrice)}/day</p>
                  </div>
                </>
              ) : <Skeleton className="w-full h-full h-80" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationsSection;
