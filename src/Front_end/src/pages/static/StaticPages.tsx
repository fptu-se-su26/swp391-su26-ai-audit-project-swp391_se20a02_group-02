import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/animations/variants';
import { useT } from '@/i18n/translations';
import { useUIStore } from '@/store';

export const AboutPage: React.FC = () => {
  const t = useT();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen pt-32 pb-20 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC] dark:bg-slate-950'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-16">
          <h1 className={`font-display text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>About LuxeWay</h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Redefining luxury mobility for the modern era.</p>
        </motion.div>
        <div className={`prose max-w-none ${isDark ? 'prose-invert' : 'prose-slate'}`}>
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>LuxeWay was founded with a single mission: to provide unparalleled access to the world's most extraordinary vehicles. We believe that driving a masterpiece should be an unforgettable experience, free from the traditional friction of exotic car rentals.</p>
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Our platform connects discerning clients with curated collections of supercars, ultra-luxury sedans, and rare classics. Every vehicle on our platform undergoes rigorous vetting, ensuring that our standards of excellence are never compromised.</p>
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Whether it's a weekend getaway, a special event, or simply the thrill of the drive, LuxeWay delivers the unattainable, straight to your door.</p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen pt-32 pb-20 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC] dark:bg-slate-950'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className={`font-display text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>Terms of Service</h1>
          <div className={`prose max-w-none ${isDark ? 'prose-invert' : 'prose-slate'}`}>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}><strong>Last Updated: October 2023</strong></p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Welcome to LuxeWay. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
            <h3 className={isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}>1. Eligibility</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>To rent a vehicle, you must be at least 25 years old and hold a valid driver's license for a minimum of 3 years.</p>
            <h3 className={isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}>2. Vehicle Use</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Vehicles must be driven responsibly and within the agreed mileage limits. Racing, off-roading, and unauthorized modifications are strictly prohibited.</p>
            <h3 className={isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}>3. Insurance &amp; Liability</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>All rentals include baseline insurance. Renters are responsible for deductibles and any damage not covered by the insurance policy.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen pt-32 pb-20 ${isDark ? 'bg-slate-900' : 'bg-[#F8FAFC] dark:bg-slate-950'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className={`font-display text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>Privacy Policy</h1>
          <div className={`prose max-w-none ${isDark ? 'prose-invert' : 'prose-slate'}`}>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}><strong>Last Updated: October 2023</strong></p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>At LuxeWay, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
            <h3 className={isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}>Information We Collect</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>We collect information you provide directly, such as identity documents, payment details, and contact information. We also collect usage data when you interact with our platform.</p>
            <h3 className={isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}>How We Use Your Information</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Your data is used to verify your identity, process payments, facilitate rentals, and improve our services.</p>
            <h3 className={isDark ? 'text-white' : 'text-[#0F172A] dark:text-white'}>Data Security</h3>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>We employ industry-standard encryption and security practices to safeguard your data. Your payment information is securely processed by Stripe and is never stored on our servers.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
