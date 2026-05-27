import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2, Users, BarChart3, Shield, Clock, Zap,
  CheckCircle, ArrowRight, Star, Phone, Mail
} from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';

const FEATURES = [
  {
    icon: Building2,
    title: 'Fleet Management',
    desc: 'Manage your entire vehicle fleet from a single dashboard. Track utilization, maintenance, and availability in real time.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Users,
    title: 'Multi-User Access',
    desc: 'Grant your employees role-based access to book vehicles, manage schedules, and view reports — all controlled by you.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    desc: 'Get detailed insights into your rental spend, carbon footprint, and fleet efficiency with export-ready reports.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Priority Support',
    desc: 'Dedicated business account manager and 24/7 priority customer support to keep your operations running smoothly.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Clock,
    title: 'Flexible Contracts',
    desc: 'Monthly, quarterly, or annual contracts tailored to your business needs with volume discounts and fixed pricing.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    desc: 'Skip the approval queue. Pre-approved business accounts can book any vehicle instantly with guaranteed availability.',
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '2,500,000',
    period: '/month',
    vehicles: 'Up to 5 vehicles',
    users: '3 team members',
    features: ['Basic fleet dashboard', 'Monthly reports', 'Email support', 'Instant booking'],
    highlight: false,
  },
  {
    name: 'Business',
    price: '7,500,000',
    period: '/month',
    vehicles: 'Up to 20 vehicles',
    users: '10 team members',
    features: ['Full fleet management', 'Weekly reports', 'Priority support', 'Instant booking', 'API access', 'Custom branding'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    vehicles: 'Unlimited vehicles',
    users: 'Unlimited members',
    features: ['Everything in Business', 'Dedicated manager', 'SLA guarantees', 'On-site training', 'White-label options', 'Custom integrations'],
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Nguyen Thanh Tung',
    role: 'Operations Manager, TechCorp VN',
    text: 'LuxeWay Business cut our transport costs by 35% in the first quarter. The fleet dashboard is incredibly intuitive.',
    rating: 5,
    avatar: 'TT',
  },
  {
    name: 'Tran Bich Ngoc',
    role: 'HR Director, Sunrise Group',
    text: 'Managing vehicle bookings for 50+ employees used to be a nightmare. Now it takes minutes. Highly recommended.',
    rating: 5,
    avatar: 'TN',
  },
  {
    name: 'Le Van Duc',
    role: 'CEO, Ducvl Logistics',
    text: 'The analytics reports helped us identify underutilized vehicles and save significantly on our fleet costs.',
    rating: 5,
    avatar: 'LD',
  },
];

const BusinessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#0F172A]">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={staggerItem}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/30 rounded-full text-gold text-sm font-semibold mb-6">
                <Building2 className="w-4 h-4" />
                LuxeWay for Business
              </span>
            </motion.div>
            <motion.h1 variants={staggerItem} className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Drive Your Business<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-300">
                Forward
              </span>
            </motion.h1>
            <motion.p variants={staggerItem} className="text-white/70 text-xl mb-10 max-w-2xl leading-relaxed">
              The complete fleet management solution for businesses of all sizes. Save time, cut costs, and empower your team with LuxeWay Business.
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
              <a href="mailto:business@luxeway.vn" className="btn-gold px-8 py-4 text-base inline-flex items-center gap-2">
                <Phone className="w-5 h-5" /> Contact Sales
              </a>
              <Link to="/marketplace" className="btn-outline px-8 py-4 text-base inline-flex items-center gap-2 border-white/30 text-white hover:bg-white/10">
                Browse Fleet <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-6 mt-12">
              {[
                { icon: '🏢', label: '500+ Companies' },
                { icon: '🚗', label: '10,000+ Trips/month' },
                { icon: '⭐', label: '4.9 Business Rating' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-white/60">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-sm font-medium">{b.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container-lux">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <span className="text-label text-gold mb-2 block">Why LuxeWay Business?</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              Everything Your Business Needs
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              From solo entrepreneurs to enterprise fleets — LuxeWay Business scales with you.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map(f => (
              <motion.div
                key={f.title}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="luxury-card p-6 group hover:shadow-luxury transition-all duration-300"
              >
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-slate-50">
        <div className="container-lux">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <span className="text-label text-gold mb-2 block">Transparent Pricing</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              Choose Your Plan
            </h2>
            <p className="text-slate-500 text-lg">All plans include a 14-day free trial. No credit card required.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          >
            {PLANS.map(plan => (
              <motion.div
                key={plan.name}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className={`relative luxury-card p-8 flex flex-col transition-all duration-300 ${
                  plan.highlight ? 'border-2 border-accent shadow-luxury ring-1 ring-accent/10' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-accent text-white text-xs font-bold rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-[#0F172A]">
                      {plan.price === 'Custom' ? 'Custom' : `₫${plan.price}`}
                    </span>
                    {plan.period && <span className="text-slate-400 text-sm pb-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{plan.vehicles} • {plan.users}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:business@luxeway.vn"
                  className={`block text-center py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-accent text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-[#0F172A] hover:bg-slate-200'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container-lux">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <span className="text-label text-gold mb-2 block">Trusted by Leaders</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              What Business Clients Say
            </h2>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map(t => (
              <motion.div key={t.name} variants={staggerItem} className="luxury-card p-6">
                <div className="flex text-yellow-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400" />)}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A]">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-r from-[#0F172A] to-[#1E3A5F]">
        <div className="container-lux text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Upgrade Your Fleet?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
              Our business team is ready to build a custom plan for you. Get in touch today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="mailto:business@luxeway.vn" className="btn-gold px-8 py-4 inline-flex items-center gap-2">
                <Mail className="w-5 h-5" /> business@luxeway.vn
              </a>
              <a href="tel:+84900000000" className="btn-outline border-white/30 text-white hover:bg-white/10 px-8 py-4 inline-flex items-center gap-2">
                <Phone className="w-5 h-5" /> +84 900 000 000
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BusinessPage;
