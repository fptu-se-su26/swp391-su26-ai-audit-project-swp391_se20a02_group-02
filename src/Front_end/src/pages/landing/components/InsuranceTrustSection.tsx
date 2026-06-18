import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BadgeCheck, AlertTriangle, Headphones } from 'lucide-react';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export const InsuranceTrustSection: React.FC = () => (
  <section className="py-24 bg-white dark:bg-slate-900">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Left content */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.span variants={staggerItem} className="text-xs font-bold tracking-widest uppercase text-emerald-500 mb-3 block">
            Your Safety First
          </motion.span>
          <motion.h2 variants={staggerItem} className="font-bold text-3xl md:text-4xl text-[#0F172A] mb-4">
            Insurance & Protection<br />Built Into Every Trip
          </motion.h2>
          <motion.p variants={staggerItem} className="text-slate-500 mb-8 leading-relaxed">
            We've partnered with leading insurers to give every LuxeWay booking comprehensive coverage so you drive with confidence.
          </motion.p>
          <motion.div variants={staggerContainer} className="space-y-6">
            {[
              { icon: Shield, title: 'Up to ₫500M Coverage', desc: 'Comprehensive vehicle protection included with every rental.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: BadgeCheck, title: 'Owner KYC Verification', desc: 'All vehicle owners pass identity verification before listing.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: AlertTriangle, title: 'Fraud Prevention', desc: 'AI-powered monitoring and manual review of every transaction.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Headphones, title: '24/7 Emergency Hotline', desc: 'Call us anytime — a real person will answer in under 2 minutes.', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} variants={staggerItem} className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <div>
                  <p className="font-extrabold text-[#0F172A] text-base md:text-lg mb-1">{title}</p>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
 
        {/* Right: Trust stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-6"
        >
          {[
            { value: '₫500M', label: 'Max Insurance Coverage', sub: 'Per trip' },
            { value: '100%', label: 'Owner Identity Verified', sub: 'Before listing' },
            { value: '<2min', label: 'Emergency Response', sub: 'Average time' },
            { value: '99.2%', label: 'Dispute Resolution Rate', sub: 'Customer satisfaction' },
          ].map(({ value, label, sub }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-colors"
            >
              <p className="font-black text-3xl md:text-5xl text-[#0F172A] mb-2 tracking-tight">{value}</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base mb-1">{label}</p>
              <p className="text-slate-400 text-xs md:text-sm">{sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default InsuranceTrustSection;
