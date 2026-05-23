import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/animations/variants';

export const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pt-32 pb-20">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] dark:text-white mb-6">About LuxeWay</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">Redefining luxury mobility for the modern era.</p>
      </motion.div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>LuxeWay was founded with a single mission: to provide unparalleled access to the world's most extraordinary vehicles. We believe that driving a masterpiece should be an unforgettable experience, free from the traditional friction of exotic car rentals.</p>
        <p>Our platform connects discerning clients with curated collections of supercars, ultra-luxury sedans, and rare classics. Every vehicle on our platform undergoes rigorous vetting, ensuring that our standards of excellence are never compromised.</p>
        <p>Whether it's a weekend getaway, a special event, or simply the thrill of the drive, LuxeWay delivers the unattainable, straight to your door.</p>
      </div>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pt-32 pb-20">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-4xl font-bold text-[#0F172A] dark:text-white mb-6">Terms of Service</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p><strong>Last Updated: October 2023</strong></p>
          <p>Welcome to LuxeWay. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
          <h3>1. Eligibility</h3>
          <p>To rent a vehicle, you must be at least 25 years old and hold a valid driver's license for a minimum of 3 years.</p>
          <h3>2. Vehicle Use</h3>
          <p>Vehicles must be driven responsibly and within the agreed mileage limits. Racing, off-roading, and unauthorized modifications are strictly prohibited.</p>
          <h3>3. Insurance & Liability</h3>
          <p>All rentals include baseline insurance. Renters are responsible for deductibles and any damage not covered by the insurance policy.</p>
        </div>
      </motion.div>
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pt-32 pb-20">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-4xl font-bold text-[#0F172A] dark:text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p><strong>Last Updated: October 2023</strong></p>
          <p>At LuxeWay, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
          <h3>Information We Collect</h3>
          <p>We collect information you provide directly, such as identity documents, payment details, and contact information. We also collect usage data when you interact with our platform.</p>
          <h3>How We Use Your Information</h3>
          <p>Your data is used to verify your identity, process payments, facilitate rentals, and improve our services.</p>
          <h3>Data Security</h3>
          <p>We employ industry-standard encryption and security practices to safeguard your data. Your payment information is securely processed by Stripe and is never stored on our servers.</p>
        </div>
      </motion.div>
    </div>
  </div>
);
