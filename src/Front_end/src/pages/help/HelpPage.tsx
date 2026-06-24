import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Book, Phone, ChevronDown, ChevronRight, Search, Zap, Shield, Star } from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';

const FAQS = [
  {
    category: 'Booking',
    items: [
      { q: 'How do I book a vehicle?', a: 'Browse our marketplace, select a vehicle, choose your dates, add extras, and complete payment. Most vehicles offer instant booking — no approval needed.' },
      { q: 'Can I cancel my booking?', a: 'Yes! Free cancellation up to 48 hours before pickup. After that, a 50% cancellation fee applies. Cancellations within 12 hours are non-refundable.' },
      { q: 'What happens if the owner cancels?', a: 'You\'ll receive a full refund within 2-3 business days, plus a 10% credit on your next booking as a goodwill gesture.' },
      { q: 'How does Instant Book work?', a: 'Vehicles with the ⚡ badge can be booked immediately without waiting for owner approval. Your booking is confirmed the moment payment is processed.' },
    ]
  },
  {
    category: 'Insurance & Safety',
    items: [
      { q: 'Am I insured during the rental?', a: 'All rentals include basic third-party liability. We strongly recommend adding our Premium Insurance ($45/day) which covers $5M damage, theft, and zero excess.' },
      { q: 'What documents do I need?', a: 'A valid driver\'s license, government-issued ID, and a credit card in your name. International licenses are accepted in most countries.' },
      { q: 'What if I\'m in an accident?', a: 'Contact emergency services first. Then call our 24/7 support line at 1-800-LUXEWAY. We\'ll handle everything including towing and insurance claims.' },
    ]
  },
  {
    category: 'Payments',
    items: [
      { q: 'When am I charged?', a: 'You\'re charged when your booking is confirmed. For instant book vehicles, that\'s immediately. For request-based vehicles, once the owner accepts.' },
      { q: 'What payment methods are accepted?', a: 'Visa, Mastercard, Amex, Apple Pay, Google Pay, and LuxeWallet (our prepaid balance). Crypto coming soon.' },
      { q: 'When is the security deposit returned?', a: 'Within 3-5 business days after the vehicle is returned in the agreed condition. If there\'s damage, the assessment process may take up to 14 days.' },
    ]
  },
];

const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(
      i => !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-sm font-medium px-4 py-2 rounded-full border border-white/20 mb-6">
              <HelpCircle className="w-4 h-4" /> Help Center
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">How can we help?</h1>
            <p className="text-white/70 text-lg mb-8">Find answers to common questions about rentals, payments, and safety.</p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-[#0F172A] outline-none shadow-xl text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Quick Links */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: Zap, title: 'Quick Start', desc: 'Get started with your first rental', href: '/marketplace' },
            { icon: Shield, title: 'Insurance Guide', desc: 'Coverage options explained', href: '#insurance' },
            { icon: MessageSquare, title: 'Contact Support', desc: 'Talk to our team 24/7', href: '/messages' },
          ].map(card => (
            <motion.a key={card.title} href={card.href} variants={staggerItem}
              className="luxury-card p-5 hover:shadow-luxury-lg transition-all group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-accent transition-colors">
                <card.icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-[#0F172A] dark:text-white mb-1">{card.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
              <ChevronRight className="w-4 h-4 text-slate-300 mt-2 group-hover:text-accent transition-colors" />
            </motion.a>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white mb-8">Frequently Asked Questions</h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-semibold text-[#0F172A] dark:text-white mb-2">No results found</h3>
            <p className="text-slate-400 text-sm">Try different keywords or contact support</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map(cat => (
              <div key={cat.category}>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <div key={item.q} className="luxury-card overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className="font-medium text-[#0F172A] dark:text-white text-sm">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === item.q ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === item.q && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5"
                        >
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Banner */}
        <div className="mt-16 luxury-card p-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] text-center">
          <h3 className="font-display text-2xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-white/70 mb-6 text-sm">Our support team is available 24/7 via live chat, email, or phone.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/messages" className="btn-primary px-6 py-3">
              <MessageSquare className="w-4 h-4" /> Live Chat
            </a>
            <a href="tel:+18005893929" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors flex items-center gap-2 justify-center">
              <Phone className="w-4 h-4" /> 1-800-LUXEWAY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
