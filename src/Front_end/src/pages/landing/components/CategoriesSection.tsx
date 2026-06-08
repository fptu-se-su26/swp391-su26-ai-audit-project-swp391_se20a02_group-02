import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Bike } from 'lucide-react';
import type { CategoryData } from '@/services/homeService';

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

const CAR_CATEGORIES = [
  { key: 'economy', label: 'Economy', icon: '🚗', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop' },
  { key: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=800&auto=format&fit=crop' },
  { key: 'suv', label: 'SUV', icon: '🚙', image: 'https://images.unsplash.com/photo-1609166214994-502d326bafee?q=80&w=800&auto=format&fit=crop' },
  { key: 'business', label: 'Business', icon: '💼', image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format&fit=crop' },
  { key: 'electric', label: 'Electric', icon: '⚡', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop' },
];
const MOTO_CATEGORIES = [
  { key: 'motorbike', label: 'Scooter', icon: '🛵', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop' },
  { key: 'city_car', label: 'City Bike', icon: '🏍️', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop' },
  { key: 'tourism', label: 'Touring', icon: '🏕️', image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=800&auto=format&fit=crop' },
];

interface CategoryGridProps {
  categories: typeof CAR_CATEGORIES;
  counts: Record<string, number>;
  title: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, counts, title }) => {
  const navigate = useNavigate();
  return (
    <div>
      <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        {title === 'Cars' ? <Car className="w-7 h-7 text-amber-500" /> : <Bike className="w-7 h-7 text-amber-500" />}
        {title}
      </h3>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map(cat => (
          <motion.div
            key={cat.key}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', damping: 18 }}
            className="relative rounded-[2rem] overflow-hidden h-56 cursor-pointer group shadow-lg border border-slate-100/10 dark:border-slate-800/80 bg-slate-900"
            onClick={() => navigate(`/marketplace?category=${cat.key}`)}
          >
            <img src={cat.image} alt={cat.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl leading-none mb-2.5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 origin-left">{cat.icon}</p>
                  <p className="text-white font-extrabold text-base tracking-wide group-hover:text-amber-400 transition-colors">{cat.label}</p>
                </div>
                <span className="text-xs text-white bg-black/40 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl font-bold group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-400 transition-all duration-300">
                  {counts[cat.key] ?? 0} xe
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

interface CategoriesSectionProps {
  data: CategoryData | null;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ data }) => (
  <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-14">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">Our Fleet</span>
        <h2 className="font-bold text-3xl md:text-5xl text-slate-900 dark:text-white">Browse by Category</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Find the right vehicle for every occasion</p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <CategoryGrid title="Cars" categories={CAR_CATEGORIES} counts={data?.cars ?? {}} />
        <CategoryGrid title="Motorbikes" categories={MOTO_CATEGORIES} counts={data?.motorbikes ?? {}} />
      </div>
    </div>
  </section>
);

export default CategoriesSection;
