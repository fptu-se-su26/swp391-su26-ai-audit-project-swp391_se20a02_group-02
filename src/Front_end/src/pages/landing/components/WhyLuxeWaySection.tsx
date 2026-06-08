import React from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck, FileText, MessageCircle, Lock, Shield,
  AlertTriangle, BarChart3, Truck
} from 'lucide-react';

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

const WHY_FEATURES = [
  { icon: BadgeCheck, title: 'KYC Verification', desc: 'All owners complete rigorous identity verification before listing.', color: 'bg-emerald-500/10 text-emerald-450 border border-emerald-550/20' },
  { icon: FileText, title: 'Digital Contracts', desc: 'Legally-binding e-contracts signed in under 2 minutes.', color: 'bg-blue-500/10 text-blue-450 border border-blue-550/20' },
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Direct messaging between renters and owners at any time.', color: 'bg-violet-500/10 text-violet-450 border border-violet-550/20' },
  { icon: Lock, title: 'Secure VNPay', desc: 'Bank-grade encrypted payments via VNPay gateway.', color: 'bg-amber-500/10 text-amber-455 border border-amber-550/20' },
  { icon: Shield, title: 'Insurance Coverage', desc: 'Every rental covered up to ₫500M by our partner insurers.', color: 'bg-rose-500/10 text-rose-450 border border-rose-550/20' },
  { icon: AlertTriangle, title: 'Dispute Resolution', desc: 'Dedicated mediators handle any disputes fairly and quickly.', color: 'bg-orange-500/10 text-orange-450 border border-orange-550/20' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Owners get real-time fleet analytics and revenue insights.', color: 'bg-indigo-500/10 text-indigo-450 border border-indigo-550/20' },
  { icon: Truck, title: 'Door-to-Door Delivery', desc: 'Select owners offer vehicle delivery to your address.', color: 'bg-teal-500/10 text-teal-450 border border-teal-550/20' },
];

export const WhyLuxeWaySection: React.FC = () => (
  <section className="py-20 bg-gradient-to-b from-[#0F172A] to-slate-950">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3 block">Platform Advantages</span>
        <h2 className="font-bold text-3xl md:text-5xl text-white mb-4">Why Choose LuxeWay</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Built for trust. Designed for conversion. Powered by real technology.
        </p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {WHY_FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', damping: 20 }}
            className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/25 transition-all duration-300 group"
          >
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-white text-lg md:text-xl mb-3">{title}</h3>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default WhyLuxeWaySection;
