import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronRight, Phone, MessageSquare,
  BookOpen, CreditCard, Car, User, BadgeCheck, Shield, Key, AlertTriangle,
  Calendar, Eye, Tag, ArrowLeft, RefreshCw, Loader2, X,
  Send, Clock, CheckCircle2, AlertCircle, Ticket
} from 'lucide-react';
import { helpService, ticketService } from '@/services/helpService';
import type { HelpCategory, HelpArticle, SupportTicket, CreateTicketPayload } from '@/services/helpService';
import { homeService } from '@/services/homeService';
import { useAuthStore } from '@/store';
import { useT } from '@/i18n/translations';

// =====================================================
// ICON MAP — maps backend icon string to Lucide component
// =====================================================
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar, CreditCard, Car, User, BadgeCheck, Shield, Key, AlertTriangle,
  BookOpen, Search, Phone, MessageSquare, CheckCircle2,
};

const CategoryIcon: React.FC<{ name?: string; className?: string }> = ({ name, className = 'w-6 h-6' }) => {
  const Icon: React.ComponentType<{ className?: string }> = (name && ICON_MAP[name]) || BookOpen;
  return <Icon className={className} />;
};

// =====================================================
// ANIMATIONS
// =====================================================
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// =====================================================
// SKELETON
// =====================================================
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />
);

// =====================================================
// STATUS BADGE
// =====================================================
const StatusBadge: React.FC<{ status: SupportTicket['status'] }> = ({ status }) => {
  const t = useT();
  const map: Record<string, { label: string; cls: string }> = {
    OPEN:          { label: t.help.ticketStatusOpen,         cls: 'bg-blue-100 text-blue-700' },
    IN_PROGRESS:   { label: t.help.ticketStatusInProgress,   cls: 'bg-amber-100 text-amber-700' },
    WAITING_USER:  { label: t.help.ticketStatusWaitingUser,  cls: 'bg-orange-100 text-orange-700' },
    RESOLVED:      { label: t.help.ticketStatusResolved,     cls: 'bg-emerald-100 text-emerald-700' },
    CLOSED:        { label: t.help.ticketStatusClosed,       cls: 'bg-slate-100 text-slate-600' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

// =====================================================
// ARTICLE VIEWER MODAL
// =====================================================
const ArticleViewer: React.FC<{
  articleId: number | null;
  onClose: () => void;
}> = ({ articleId, onClose }) => {
  const t = useT();
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    helpService.getArticle(articleId)
      .then(a => { setArticle(a); })
      .catch(() => setError(t.help.failedLoadArticle))
      .finally(() => setLoading(false));
  }, [articleId, t.help.failedLoadArticle]);

  if (!articleId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen className="w-4 h-4" />
              <span>{article?.categoryTitle ?? t.help.helpArticle}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {article && !loading && (
              <div>
                <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-4 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5" /> {article.viewCount} {t.help.views}
                  </span>
                  {article.tags?.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
                {/* Content rendered as plain text with newlines */}
                <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                  {article.content?.split('\n').map((line, i) => (
                    <p key={i} className={line.trim() === '' ? 'mt-4' : 'mb-2'}>
                      {line.startsWith('**') && line.endsWith('**')
                        ? <strong>{line.slice(2, -2)}</strong>
                        : line.startsWith('- ')
                          ? <span className="flex gap-2"><span className="text-amber-500 font-bold">•</span>{line.slice(2)}</span>
                          : line
                      }
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// =====================================================
// TICKET FORM
// =====================================================
const TicketForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateTicketPayload>({
    subject: '', category: 'BOOKING', priority: 'NORMAL', bookingId: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Subject and message are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await ticketService.createTicket({ ...form, bookingId: form.bookingId || undefined });
      onSuccess();
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to submit ticket. Please try again.';
      setError(msg);
      console.error('[TicketForm] submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Ticket className="w-5 h-5" />
            <h2 className="font-bold text-lg">Submit Support Request</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Briefly describe your issue..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-white"
              >
                {['BOOKING','PAYMENT','VEHICLE','ACCOUNT','KYC','DISPUTE','OTHER'].map(c => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-white"
              >
                {['LOW','NORMAL','HIGH','URGENT'].map(p => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Booking ID <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.bookingId}
              onChange={e => setForm(f => ({ ...f, bookingId: e.target.value }))}
              placeholder="e.g. BK-2024-001 (if related to a booking)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Describe your issue in detail..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] resize-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#0F172A] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// =====================================================
// MY TICKETS PANEL
// =====================================================
const MyTicketsPanel: React.FC<{ userId: string | null }> = ({ userId }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    ticketService.getMyTickets()
      .then(setTickets)
      .catch((err) => {
        console.error('[MyTicketsPanel] load error:', err);
        setError('Failed to load your tickets.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (!userId) {
    return (
      <div className="text-center py-12 text-slate-400">
        <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">Sign in to view your support tickets</p>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={load} className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:underline">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No support tickets yet</p>
        <p className="text-sm mt-1">Submit a request below if you need help.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map(t => (
        <motion.div key={t.id} variants={fadeUp}
          className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-400">#{t.id}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-400 font-medium">{t.category}</span>
              </div>
              <p className="font-bold text-slate-800 text-sm truncate">{t.subject}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </div>
            </div>
            <StatusBadge status={t.status} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// =====================================================
// MAIN HELP PAGE
// =====================================================
const HelpPage: React.FC = () => {
  // ---- State ----
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  const [viewingArticleId, setViewingArticleId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth state — get userId from AuthStore
  const user = useAuthStore(s => s.user);
  const userId = user?.id ?? null;

  // ---- Load categories ----
  const loadCategories = useCallback(() => {
    setCatLoading(true);
    setCatError(null);
    helpService.getCategories()
      .then(setCategories)
      .catch((err) => {
        console.error('[HelpPage] categories load error:', err);
        setCatError('Failed to load help categories. Please try again.');
      })
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ---- Load articles by category ----
  const loadArticles = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setArtLoading(true);
    setArtError(null);
    helpService.getArticlesByCategory(slug)
      .then(setArticles)
      .catch((err) => {
        console.error('[HelpPage] articles load error:', err);
        setArtError('Failed to load articles. Please try again.');
      })
      .finally(() => setArtLoading(false));
  }, []);

  // ---- Debounced search ----
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await helpService.searchArticles(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('[HelpPage] search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const selectedCategory = categories.find(c => c.slug === selectedSlug);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] pt-16">

      {/* ============ HERO ============ */}
      <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1a2e4a] to-[#0F172A] py-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          className="relative max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-sm font-bold px-5 py-2.5 rounded-full border border-white/20 mb-6 tracking-wide uppercase"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            LuxeWay Help Center
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="font-extrabold text-4xl md:text-5xl text-white mb-4 leading-tight"
          >
            How can we help you?
          </motion.h1>
          <motion.p variants={fadeUp}
            className="text-white/60 text-lg mb-10"
          >
            Search our knowledge base or browse by category below.
          </motion.p>

          {/* Search bar */}
          <motion.div variants={fadeUp} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            {searchLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, keywords..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xl text-base outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              id="help-search-input"
            />
          </motion.div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="relative max-w-xl mx-auto mt-2 z-40"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden text-left max-h-80 overflow-y-auto">
                  {searchResults.length === 0 && !searchLoading && (
                    <p className="p-5 text-sm text-slate-500 text-center">No articles found for "{searchQuery}"</p>
                  )}
                  {searchResults.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setViewingArticleId(a.id); setSearchQuery(''); }}
                      className="w-full flex items-start gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b last:border-none border-slate-50 dark:border-slate-700 text-left"
                    >
                      <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{a.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.categoryTitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick stats */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { label: `${categories.length || '8'} Categories`, icon: BookOpen },
              { label: `${categories.reduce((s, c) => s + (c.articleCount ?? 0), 0) || '15'} Articles`, icon: Search },
              { label: '24/7 Support', icon: Clock },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <Icon className="w-4 h-4 text-amber-400" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ============ CATEGORY GRID ============ */}
      <div className="max-w-5xl mx-auto px-4 py-14">

        {catError && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-8">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{catError}</p>
            </div>
            <button onClick={loadCategories}
              className="flex items-center gap-1.5 text-rose-700 text-sm font-bold hover:underline">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-8">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white">Browse by Topic</h2>
          <p className="text-slate-500 text-sm mt-1">Select a category to browse all articles in that topic.</p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-14"
        >
          {catLoading
            ? Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
            : categories.map(cat => (
              <motion.button
                key={cat.slug}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', damping: 20 }}
                onClick={() => loadArticles(cat.slug)}
                className={`p-5 rounded-2xl border text-left transition-all group shadow-sm ${
                  selectedSlug === cat.slug
                    ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg'
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md dark:bg-slate-800 dark:border-slate-700'
                }`}
                id={`help-cat-${cat.slug}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  selectedSlug === cat.slug ? 'bg-white/15' : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-amber-50'
                }`}>
                  <CategoryIcon name={cat.icon} className={`w-5 h-5 ${
                    selectedSlug === cat.slug ? 'text-amber-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-amber-500'
                  }`} />
                </div>
                <p className={`font-bold text-sm ${selectedSlug === cat.slug ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                  {cat.title}
                </p>
                <p className={`text-xs mt-1 ${selectedSlug === cat.slug ? 'text-white/60' : 'text-slate-400'}`}>
                  {cat.articleCount ?? 0} articles
                </p>
              </motion.button>
            ))
          }
        </motion.div>

        {/* ============ ARTICLES PANEL ============ */}
        <AnimatePresence mode="wait">
          {selectedSlug && (
            <motion.div
              key={selectedSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-14"
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setSelectedSlug(null); setArticles([]); }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-slate-200">|</span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  {selectedCategory?.title}
                </h3>
              </div>

              {artError && (
                <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-6">
                  <p className="text-rose-700 text-sm font-semibold">{artError}</p>
                  <button onClick={() => loadArticles(selectedSlug!)}
                    className="flex items-center gap-1 text-rose-700 text-sm font-bold hover:underline">
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {artLoading
                  ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)
                  : articles.length === 0
                    ? (
                      <div className="text-center py-10 text-slate-400">
                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No articles in this category yet.</p>
                      </div>
                    )
                    : articles.map(a => (
                      <motion.button
                        key={a.id}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', damping: 20 }}
                        onClick={() => setViewingArticleId(a.id)}
                        className="w-full flex items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 hover:shadow-md transition-all text-left group"
                        id={`help-article-${a.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate">{a.title}</p>
                          <p className="text-xs text-slate-400 truncate">{a.excerpt}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-slate-300">
                              <Eye className="w-3 h-3" /> {a.viewCount}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                      </motion.button>
                    ))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ SUPPORT TICKET SECTION ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">

          {/* Submit ticket */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Submit a Request</h3>
                <p className="text-xs text-slate-400">Our team responds within 24h</p>
              </div>
            </div>
            {ticketSuccess ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <p className="font-bold text-slate-800 dark:text-white">Ticket submitted!</p>
                <p className="text-sm text-slate-400 text-center">We'll get back to you within 24 hours.</p>
                <button onClick={() => setTicketSuccess(false)}
                  className="mt-2 text-sm font-semibold text-[#0F172A] hover:underline">
                  Submit another
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Can't find what you're looking for? Describe your issue and a support agent will reply via email and in-app.
                </p>
                {userId ? (
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="w-full py-3 rounded-xl bg-[#0F172A] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    id="open-ticket-form-btn"
                  >
                    <Send className="w-4 h-4" />
                    Open a Ticket
                  </button>
                ) : (
                  <a href="/auth/login"
                    className="block w-full py-3 rounded-xl bg-[#0F172A] text-white font-bold text-sm text-center hover:bg-slate-800 transition-colors"
                  >
                    Sign in to Submit a Ticket
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick contacts */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Contact Support</h3>
                <p className="text-xs text-slate-400">Available 24/7</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: MessageSquare, label: 'Live Chat', sub: 'Instant reply', href: '/messages', color: 'text-blue-600 bg-blue-50' },
                { icon: Phone, label: '1800-LUXEWAY', sub: 'Toll free', href: 'tel:+18005893929', color: 'text-emerald-600 bg-emerald-50' },
              ].map(({ icon: Icon, label, sub, href, color }) => (
                <a key={label} href={href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ============ MY TICKETS ============ */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">My Support Tickets</h2>
            {userId && (
              <span className="text-xs text-slate-400 font-medium">Your submitted requests</span>
            )}
          </div>
          <MyTicketsPanel userId={userId} />
        </div>

        {/* ============ FAQ ACCORDION (from existing FAQ endpoint) ============ */}
        <FaqSection />

      </div>

      {/* Article viewer modal */}
      <AnimatePresence>
        {viewingArticleId && (
          <ArticleViewer
            articleId={viewingArticleId}
            onClose={() => setViewingArticleId(null)}
          />
        )}
      </AnimatePresence>

      {/* Ticket form modal */}
      <AnimatePresence>
        {showTicketForm && (
          <TicketForm
            onClose={() => setShowTicketForm(false)}
            onSuccess={() => { setShowTicketForm(false); setTicketSuccess(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// =====================================================
// FAQ ACCORDION (loads from existing /faqs endpoint)
// =====================================================
const FaqSection: React.FC = () => {
  const [faqs, setFaqs] = useState<{ id: number; q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    homeService.getFaqs()
      .then((data) => setFaqs(data ?? []))
      .catch((err: any) => {
        console.error('[FaqSection] load error:', err);
        setError('Failed to load FAQs. Please retry.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-200">
        <p className="text-rose-700 text-sm font-semibold">{error}</p>
        <button onClick={load} className="flex items-center gap-1 text-rose-700 text-sm font-bold hover:underline">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
        <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        <p className="text-slate-500 text-sm mt-1">Quick answers to the most common questions.</p>
      </motion.div>
      <div className="space-y-2">
        {faqs.map((faq: any, i: number) => {
          const id = faq.id ?? i;
          const isOpen = openId === id;
          return (
            <motion.div
              key={id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                id={`faq-${id}`}
              >
                <span className="font-semibold text-slate-800 dark:text-white text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HelpPage;
