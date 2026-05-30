import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Book, Phone, ChevronDown, ChevronRight, Search, Zap, Shield, Star } from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { useT } from '@/i18n/translations';

const HelpPage: React.FC = () => {
  const t = useT();
  const [openFaq, setOpenFaq] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [faqs, setFaqs] = React.useState<any[]>([
    {
      category: 'General',
      items: [
        { q: 'How does LuxeWay verify vehicles?', a: 'Every vehicle undergoes a comprehensive inspection...' }
      ]
    }
  ]);

  React.useEffect(() => {
    import('@/services/otherServices').then(({ faqService }) => {
      faqService.getFAQs().then((data: any) => {
        if (data && data.length > 0) {
          // Group by category (we don't have category in DB yet, so group under General)
          setFaqs([{ category: 'General', items: data }]);
        }
      });
    });
  }, []);

  const getLocalizedFaq = (rawQ: string, rawA: string) => {
    const faqKeys = [
      { key: 'faq1', enQ: 'How does LuxeWay verify vehicles?' },
      { key: 'faq2', enQ: 'What insurance is included?' },
      { key: 'faq3', enQ: 'Can I cancel my booking?' },
      { key: 'faq4', enQ: 'How does delivery work?' },
      { key: 'faq5', enQ: 'Is there a minimum age requirement?' },
      { key: 'faq6', enQ: 'How are payments processed?' }
    ];
    
    const found = faqKeys.find(f => f.enQ.toLowerCase().trim() === rawQ.toLowerCase().trim());
    if (found && t.help?.faqs?.[found.key as 'faq1']) {
      return {
        q: t.help.faqs[found.key as 'faq1'].q,
        a: t.help.faqs[found.key as 'faq1'].a
      };
    }
    return { q: rawQ, a: rawA };
  };

  const filtered = faqs.map(cat => ({
    ...cat,
    items: cat.items.map((i: any) => {
      const loc = getLocalizedFaq(i.q, i.a);
      return { ...i, q: loc.q, a: loc.a };
    }).filter(
      (i: any) => !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-sm font-medium px-4 py-2 rounded-full border border-white/20 mb-6">
              <HelpCircle className="w-4 h-4" /> {t.help.helpCenter}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">{t.help.title}</h1>
            <p className="text-white/70 text-lg mb-8">{t.help.subtitle}</p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.help.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white border border-transparent dark:border-slate-700 outline-none shadow-xl text-base focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Quick Links */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: Zap, title: t.help.quickStart, desc: t.help.quickStartDesc, href: '/marketplace' },
            { icon: Shield, title: t.help.insuranceGuide, desc: t.help.insuranceGuideDesc, href: '#insurance' },
            { icon: MessageSquare, title: t.help.contactSupport, desc: t.help.contactSupportDesc, href: '/messages' },
          ].map(card => (
            <motion.a key={card.title} href={card.href} variants={staggerItem}
              className="luxury-card p-5 hover:shadow-luxury-lg transition-all group"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-accent transition-colors">
                <card.icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-655 mt-2 group-hover:text-accent transition-colors" />
            </motion.a>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-8">{t.help.faqTitle}</h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-semibold text-foreground mb-2">{t.marketplace.noResults}</h3>
            <p className="text-muted-foreground text-sm">{t.help.noResultsDesc}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map(cat => (
              <div key={cat.category}>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-455 dark:text-slate-500 mb-3">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.items.map((item: any) => (
                    <div key={item.q} className="luxury-card overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                        className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <span className="font-medium text-foreground text-sm">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === item.q ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === item.q && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5 bg-card"
                        >
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
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
        <div className="mt-16 luxury-card p-8 bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] text-center border-none">
          <h3 className="font-display text-2xl font-bold text-white mb-2">{t.help.stillNeedHelp}</h3>
          <p className="text-white/70 mb-6 text-sm">{t.help.stillNeedHelpDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/messages" className="btn-primary px-6 py-3">
              <MessageSquare className="w-4 h-4" /> {t.help.liveChat}
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
