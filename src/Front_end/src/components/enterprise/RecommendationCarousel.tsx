import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Star, ChevronLeft, ChevronRight, Fuel } from 'lucide-react';
import { recommendationService } from '@/services/enterpriseService';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const formatVND = (val: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(val);
};

interface RecommendationCarouselProps {
  vehicleId?: string;
  vehicleType?: 'car' | 'motorbike';
  type: 'similar' | 'personal' | 'popular';
  title?: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  vehicleId,
  vehicleType = 'car',
  type,
  title
}) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        let res: any[] = [];
        if (type === 'similar' && vehicleId) {
          if (vehicleType === 'car') {
            res = await recommendationService.getSimilarCars(vehicleId, 6);
          } else {
            res = await recommendationService.getSimilarMotorbikes(vehicleId, 6);
          }
        } else {
          // fallback to personal recommendations
          if (vehicleType === 'car') {
            res = await recommendationService.getPersonalCars(6);
          } else {
            res = await recommendationService.getPersonalMotorbikes(6);
          }
        }
        setVehicles(res);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, [vehicleId, vehicleType, type]);

  const nextSlide = () => {
    if (vehicles.length <= 3) return;
    setCurrentIndex((prev) => (prev + 1) % (vehicles.length - 2));
  };

  const prevSlide = () => {
    if (vehicles.length <= 3) return;
    setCurrentIndex((prev) => (prev - 1 + (vehicles.length - 2)) % (vehicles.length - 2));
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-80 h-72 rounded-3xl bg-slate-900/40 border border-white/10 animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return null; // Don't display empty section
  }

  const defaultTitle = type === 'similar' ? 'You May Also Luxury-Match' : 'Contextual Matches Selected For You';

  return (
    <div className="space-y-4 py-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            {title || defaultTitle}
          </h3>
          <p className="text-xs text-slate-400">Handpicked premium rides selected dynamically matching your parameters</p>
        </div>

        {vehicles.length > 3 && (
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="p-2 border border-white/10 bg-slate-900/60 rounded-xl hover:bg-slate-800 transition-colors text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 border border-white/10 bg-slate-900/60 rounded-xl hover:bg-slate-800 transition-colors text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden pr-2">
        <motion.div 
          className="flex gap-6 transition-all duration-500 ease-out"
          animate={{ x: `-${currentIndex * (320 + 24)}px` }} // card size (320) + gap (24)
          style={{ width: `${vehicles.length * (320 + 24)}px` }}
        >
          {vehicles.map((v) => {
            const detailUrl = vehicleType === 'car' ? `/marketplace/cars/${v.id}` : `/marketplace/motorbikes/${v.id}`;
            const image = v.thumbnailUrl || (v.images && v.images.length > 0 ? v.images[0].url : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80');

            return (
              <div 
                key={v.id}
                className="w-80 rounded-[2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden hover-lift hover-glow shadow-lg flex-shrink-0 flex flex-col justify-between group transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs font-bold">{v.rating?.toFixed(1) ?? '5.0'}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{v.name}</h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {v.location?.city || 'Vietnam'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-white/5">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Per Day</p>
                      <p className="text-xs font-extrabold text-indigo-400">{formatVND(v.pricePerDay)}</p>
                    </div>
                    <Link 
                      to={detailUrl}
                      className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[10px] rounded-xl transition-all shadow-md shadow-indigo-500/10"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
