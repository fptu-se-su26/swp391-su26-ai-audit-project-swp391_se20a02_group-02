import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Calendar, Car, Award, Zap } from 'lucide-react';

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

const STEPS = [
  { num: '01', icon: Search, title: 'Search Vehicle', desc: 'Browse by location, category, or date. Smart filters surface the best matches instantly.', color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { num: '02', icon: Calendar, title: 'Book Online', desc: 'Pick your dates, add extras, sign the digital contract, and pay securely with VNPay.', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { num: '03', icon: Car, title: 'Receive Vehicle', desc: 'The owner delivers to your door or you pick up from the agreed location.', color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { num: '04', icon: Award, title: 'Complete Journey', desc: 'Return the vehicle, leave a review, and earn LuxeWay loyalty rewards.', color: 'from-violet-500 to-violet-700', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
];

export const HowItWorksSection: React.FC = () => (
  <section className="py-24 bg-slate-50 dark:bg-slate-950">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-3 block">Simple & Seamless</span>
        <h2 className="font-bold text-3xl md:text-5xl text-[#0F172A] mb-4">How LuxeWay Works</h2>
        <p className="text-slate-500 max-w-lg mx-auto">From search to keys-in-hand in under 5 minutes.</p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            variants={staggerItem}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 text-center group hover:shadow-lg transition-shadow"
          >
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-black flex items-center justify-center shadow-md`}>
              {step.num}
            </div>
            <div className={`w-20 h-20 ${step.bg} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
              <step.icon className={`w-10 h-10 ${step.iconColor}`} />
            </div>
            <h3 className="font-extrabold text-[#0F172A] text-lg md:text-xl mb-3">{step.title}</h3>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">{step.desc}</p>
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-200" />
            )}
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
        <Link to="/marketplace"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg,#0F172A,#1e3a5f)' }}>
          <Zap className="w-4 h-4" /> Start Exploring Now
        </Link>
      </motion.div>
    </div>
  </section>
);

export default HowItWorksSection;
