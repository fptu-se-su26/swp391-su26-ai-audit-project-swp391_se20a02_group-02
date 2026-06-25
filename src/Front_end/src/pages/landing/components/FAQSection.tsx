import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { FAQ } from '@/services/homeService';

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

interface FAQSectionProps {
  faqs: FAQ[];
  loading: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs, loading }) => {
  const [open, setOpen] = useState<number | null>(null);
  const DEFAULT_FAQS: FAQ[] = [
    { id: 1, q: 'How does LuxeWay verify vehicle owners?', a: 'All owners complete a rigorous KYC process: government ID, phone verification, bank account check, and vehicle document review before any listing goes live.' },
    { id: 2, q: 'What insurance is included in every rental?', a: 'All rentals include baseline coverage up to ₫500M per trip via our partner insurers. Additional premium coverage is available at booking.' },
    { id: 3, q: 'Can I cancel my booking?', a: 'Free cancellation is available up to 48 hours before pickup. Cancellations within 48 hours may be subject to a partial fee per the vehicle\'s policy.' },
    { id: 4, q: 'How does door-to-door delivery work?', a: 'Owners who have enabled delivery will bring the vehicle to your address. Delivery fees are shown transparently at checkout and vary by distance.' },
    { id: 5, q: 'How are payments processed and is it secure?', a: 'We use VNPay with bank-grade encryption. Payments are held in escrow and only released to owners after successful pickup confirmation.' },
    { id: 6, q: 'What happens if there is a dispute?', a: 'Our dedicated dispute resolution team reviews photo evidence and trip records. Most disputes are resolved within 24 hours with full fairness to both parties.' },
  ];
  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-3 block">Got Questions?</span>
          <h2 className="font-bold text-3xl md:text-4xl text-[#0F172A] dark:text-white">Frequently Asked Questions</h2>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3">
          {(loading ? Array(5).fill(null) : displayFaqs).map((faq, i) => (
            <motion.div key={faq?.id ?? i} variants={staggerItem}>
              {faq ? (
                <div className={`bg-white dark:bg-slate-900 rounded-2xl border transition-colors ${open === i ? 'border-amber-200' : 'border-slate-100 dark:border-slate-800'}`}>
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={open === i}
                  >
                    <span className="font-semibold text-[#0F172A] dark:text-white text-sm pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : <Skeleton className="h-14 rounded-2xl" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
