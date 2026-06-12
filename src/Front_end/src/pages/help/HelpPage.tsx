import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronRight, Phone, MessageSquare,
  BookOpen, CreditCard, Car, User, ShieldCheck, ShieldAlert, Key, AlertTriangle,
  Calendar, Eye, Tag, ArrowLeft, RefreshCw, Loader2, X,
  Send, Clock, CheckCircle2, AlertCircle, Ticket, HeartHandshake, HelpCircle, Activity, BarChart3, Sparkles
} from 'lucide-react';
import { helpService, ticketV2Service, emergencyService, kbService } from '@/services/helpService';
import { useAuthStore } from '@/store';
import { useT } from '@/i18n/translations';
import { DeliveryTrackerMap } from '@/components/help/DeliveryTrackerMap';

// =====================================================
// ICON MAP
// =====================================================
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar, CreditCard, Car, User, ShieldCheck, Key, AlertTriangle,
  BookOpen, Search, Phone, MessageSquare, CheckCircle2,
};

const CategoryIcon: React.FC<{ name?: string; className?: string }> = ({ name, className = 'w-5 h-5' }) => {
  const Icon = (name && ICON_MAP[name]) || BookOpen;
  return <Icon className={className} />;
};

// =====================================================
// ANIMATIONS
// =====================================================
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

// =====================================================
// SKELETON
// =====================================================
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-900/60 border border-slate-850 rounded-2xl ${className}`} />
);

// =====================================================
// ARTICLE VIEWER MODAL
// =====================================================
const ArticleViewer: React.FC<{
  articleSlug: string | null;
  onClose: () => void;
}> = ({ articleSlug, onClose }) => {
  const t = useT();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleSlug) return;
    setLoading(true);
    setError(null);
    kbService.getKBArticleBySlug(articleSlug)
      .then((a: any) => { setArticle(a); })
      .catch(() => setError((t.help.failedLoadArticle || "Failed to load article. Please try again.")))
      .finally(() => setLoading(false));
  }, [articleSlug, t.help.failedLoadArticle]);

  if (!articleSlug) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0b0b0d] border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-900 bg-slate-950/40">
            <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{(article?.category?.name ?? t.help.helpArticle) || 'Article'}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}
            {article && !loading && (
              <div>
                <h1 className="font-black text-2xl text-white mb-4 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold font-mono uppercase">
                    <Eye className="w-3.5 h-3.5 text-amber-500/85" /> {article.viewCount} {t.help.views || 'views'}
                  </span>
                  {article.slug?.split('-').slice(0,2).map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] rounded-full font-bold uppercase tracking-wider">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {article.content}
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
// STANDARD TICKET FORM
// =====================================================
const TicketForm: React.FC<{ onClose: () => void; onSuccess: () => void; initialCategory?: string }> = ({ onClose, onSuccess, initialCategory = 'BOOKING' }) => {
  const t = useT();
  const [form, setForm] = useState({
    subject: '', categoryId: initialCategory, priorityId: 'NORMAL', bookingId: '', description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError(t.help.subjectRequired || 'Subject and message are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await ticketV2Service.createTicketV2({
        subject: form.subject,
        description: form.description,
        categoryId: form.categoryId,
        priorityId: form.priorityId,
        bookingId: form.bookingId || undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(t.help.failedSubmitTicket || 'Failed to submit ticket. Please try again.');
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0b0b0d] border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] max-w-lg w-full overflow-hidden"
      >
        <div className="bg-gradient-to-b from-amber-950/40 via-amber-900/10 to-transparent px-7 py-5 flex items-center justify-between border-b border-slate-900">
          <div className="flex items-center gap-2 text-white">
            <Ticket className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-base tracking-wide uppercase">Open Support Claim</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.subjectLabel || 'Subject *'}</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder={t.help.subjectPlaceholder || "Briefly describe your issue..."}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.categoryLabel || 'Category'}</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50"
              >
                {['BOOKING','PAYMENT','VEHICLE','ACCOUNT','KYC','DISPUTE','OTHER'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.priorityLabel || 'Priority'}</label>
              <select
                value={form.priorityId}
                onChange={e => setForm(f => ({ ...f, priorityId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50"
              >
                {['LOW','NORMAL','HIGH','URGENT'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {t.help.bookingIdLabel || 'Booking ID'} <span className="text-slate-600 font-normal lowercase">{t.help.optionalLabel || '(optional)'}</span>
            </label>
            <input
              type="text"
              value={form.bookingId}
              onChange={e => setForm(f => ({ ...f, bookingId: e.target.value }))}
              placeholder={t.help.bookingIdPlaceholder || "e.g. BK-2026-001"}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.messageLabel || 'Message *'}</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t.help.messagePlaceholder || "Describe your issue in detail..."}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50 resize-none transition-all"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-amber-400/40 disabled:opacity-50 cursor-pointer">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// =====================================================
// EMERGENCY SUPPORT DISPATCH FORM
// =====================================================
const EmergencyForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const t = useT();
  const [emergencyType, setEmergencyType] = useState('BREAKDOWN');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim() || !description.trim()) {
      setError("Contact phone and details are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Mock latitude/longitude for Vietnam location simulation
      const latitude = 21.0285;
      const longitude = 105.8542;

      await emergencyService.submitEmergency({
        emergencyType,
        description,
        contactPhone,
        bookingId: bookingId || undefined,
        latitude,
        longitude
      });
      onSuccess();
    } catch (err) {
      console.error("Failed to submit emergency dispatch:", err);
      setError("Failed to dispatch responders. Contact hotline 1800-LUXEWAY.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-[#0b0b0d] border border-rose-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.15)] max-w-lg w-full overflow-hidden"
      >
        <div className="bg-rose-955/20 border-b border-rose-900/30 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <h2 className="font-extrabold text-base tracking-widest uppercase">
              {t.help.emergencySupport || 'Priority Emergency Dispatch'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div className="p-4 bg-rose-500/5 border border-rose-550/20 text-rose-400 rounded-2xl text-[11px] leading-relaxed">
            ⚠️ <strong>CRITICAL PRIORITY:</strong> This dispatcher alerts LuxeWay emergency responders instantly. Roadside coordinates will be located automatically. For immediate threat to life, call 113/115.
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.emergencyType || 'Emergency Type'}</label>
              <select
                value={emergencyType}
                onChange={e => setEmergencyType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-rose-500/50"
              >
                <option value="BREAKDOWN">Vehicle Breakdown</option>
                <option value="ACCIDENT">Road Collision/Accident</option>
                <option value="LOST_KEY">Lost Vehicle Keys</option>
                <option value="UNSAFE">Unsafe / Danger Threat</option>
                <option value="OWNER_NO_SHOW">Host No-Show</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.emergencyPhone || 'Contact Phone'}</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="Active callback phone number..."
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-rose-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.bookingIdLabel || 'Booking ID'} (Optional)</label>
            <input
              type="text"
              value={bookingId}
              onChange={e => setBookingId(e.target.value)}
              placeholder="e.g. BK-DEV-CAR"
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.help.emergencyDesc || 'Situation Description'}</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe vehicle location, safety status, damage details..."
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-rose-500/50 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-650 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-rose-500/40 disabled:opacity-50 cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? 'Dispatching...' : (t.help.reportEmergencyBtn || 'Dispatch Responders')}
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
  const t = useT();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    ticketV2Service.getMyTicketsV2()
      .then(setTickets)
      .catch((err) => {
        console.error('[MyTicketsPanel] load error:', err);
        setError(t.help.failedLoadTickets || 'Failed to load your tickets.');
      })
      .finally(() => setLoading(false));
  }, [userId, t.help.failedLoadTickets]);

  useEffect(() => { load(); }, [load]);

  if (!userId) {
    return (
      <div className="text-center py-12 text-slate-500 border border-slate-900/60 rounded-3xl bg-slate-950/20">
        <User className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-xs uppercase tracking-wider">{t.help.signInToViewTickets || 'Sign in to view support tickets'}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <AlertCircle className="w-8 h-8 text-rose-450" />
        <p className="text-xs text-slate-500">{error}</p>
        <button onClick={load} className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:underline cursor-pointer">
          <RefreshCw className="w-4 h-4" /> {t.help.retry || 'Retry'}
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 border border-slate-900/60 rounded-3xl bg-slate-950/20">
        <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-xs uppercase tracking-wider">{t.help.noTicketsYet || 'No support tickets yet'}</p>
        <p className="text-slate-600 text-xs mt-1">{t.help.submitBelowIfHelp || 'Submit a request below if you need help.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map(t => (
        <motion.div key={t.id} variants={fadeUp}
          className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-slate-600">ID: {t.id.slice(0, 8)}...</span>
              <span className="text-slate-800">·</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded uppercase font-bold tracking-wider">
                {t.category?.name || 'CLAIM'}
              </span>
            </div>
            <p className="font-bold text-white text-sm">{t.subject}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>SLA: {new Date(t.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(t.slaDeadline).toLocaleDateString()})</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
              t.status === 'OPEN' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
              t.status === 'IN_PROGRESS' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {t.status}
            </span>
            <span className="text-[9px] text-slate-600 font-mono font-semibold">
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// =====================================================
// MAIN HELP PAGE
// =====================================================
export const HelpPage: React.FC = () => {
  const t = useT();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;

  // State
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  const [viewingArticleSlug, setViewingArticleSlug] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketCategoryPreset, setTicketCategoryPreset] = useState('BOOKING');

  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState(false);

  // Delivery simulation input state
  const [trackBookingId, setTrackBookingId] = useState('');
  const [activeTrackingBookingId, setActiveTrackingBookingId] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch KB Categories
  const loadKBCategories = useCallback(() => {
    setCatLoading(true);
    setCatError(null);
    helpService.getCategories()
      .then(setCategories)
      .catch((err) => {
        console.error("Failed to load KB categories:", err);
        setCatError("Failed to load help topics. Refresh the page.");
      })
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    loadKBCategories();
  }, [loadKBCategories]);

  // Load articles when category changes
  const handleSelectCategory = (id: number) => {
    setSelectedCategoryId(id);
    setArtLoading(true);
    setArtError(null);
    helpService.getArticlesByCategory(id.toString())
      .then(setArticles)
      .catch(() => setArtError("Failed to load articles for this topic."))
      .finally(() => setArtLoading(false));
  };

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await helpService.searchArticles(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-[#070708] text-white pt-20 pb-16">
      
      {/* ============ HERO BACKGROUND ============ */}
      <div className="relative bg-gradient-to-b from-amber-950/20 via-slate-950 to-[#070708] py-24 px-4 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          className="relative max-w-3xl mx-auto text-center z-10"
        >
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-5 py-2 rounded-full mb-6 tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            LuxeWay Customer Support Ecosystem
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="font-black text-4xl md:text-5xl text-white mb-4 leading-tight tracking-tight"
          >
            {t.help.title || 'How can we help?'}
          </motion.h1>
          <motion.p variants={fadeUp}
            className="text-slate-400 text-sm max-w-lg mx-auto mb-10"
          >
            {t.help.subtitle || 'Browse our luxury operations manuals, track premium vehicle deliveries in real-time, or request Priority Roadside Support.'}
          </motion.p>

          {/* Search bar */}
          <motion.div variants={fadeUp} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            {searchLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.help.searchPlaceholder || "Search help articles..."}
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-xl text-sm transition-all"
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
                <div className="bg-[#0c0c0e] rounded-2xl shadow-2xl border border-slate-850 overflow-hidden text-left max-h-80 overflow-y-auto">
                  {searchResults.length === 0 && !searchLoading && (
                    <p className="p-5 text-xs text-slate-500 text-center">No articles found for "{searchQuery}"</p>
                  )}
                  {searchResults.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setViewingArticleSlug(a.slug); setSearchQuery(''); }}
                      className="w-full flex items-start gap-3 px-5 py-4 hover:bg-amber-500/5 transition-colors border-b last:border-none border-slate-900 text-left"
                    >
                      <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">{a.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.excerpt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* ============ SELF SERVICE HUB ============ */}
        <div className="mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: t.help.requestRefund || "Request Refund",
              desc: "Cancel booking and request refund dynamically",
              icon: CreditCard,
              action: () => { setTicketCategoryPreset('PAYMENT'); setShowTicketForm(true); }
            },
            {
              title: t.help.openDispute || "Open Dispute",
              desc: "Open dispute logs regarding host/renter services",
              icon: ShieldAlert,
              action: () => { setTicketCategoryPreset('DISPUTE'); setShowTicketForm(true); }
            },
            {
              title: t.help.deliveryTracker || "Track Delivery",
              desc: "Monitor delivery logs & coordinates live",
              icon: Car,
              action: () => {
                // Focus and show tracking
                const element = document.getElementById('delivery-tracking-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }
            },
            {
              title: t.help.emergencySupport || "Roadside Emergency",
              desc: "Priority dispatch for breakdown or accident Support",
              icon: AlertTriangle,
              action: () => { setShowEmergencyForm(true); }
            }
          ].map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ y: -5 }}
                onClick={srv.action}
                className="bg-[#0b0b0d] border border-slate-900 hover:border-amber-500/40 rounded-3xl p-5 text-left transition-all flex items-start gap-4 shadow-lg cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide uppercase">{srv.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{srv.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ============ SYSTEM MODULES / SPECIAL SERVICES ============ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          
          {/* Emergency dispatch portal */}
          <div className="border border-rose-500/25 bg-gradient-to-b from-rose-950/10 to-transparent rounded-3xl p-6 flex flex-col justify-between h-[200px]">
            <div>
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />
                <h4 className="text-xs font-bold tracking-widest uppercase">{t.help.emergencySupport || 'Priority Emergency Dispatch'}</h4>
              </div>
              <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                Breakdown, vehicle damage, collision, or immediate hazard support. Automatic GPS coordinates routing.
              </p>
            </div>
            {emergencySuccess ? (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Dispatched Successfully
              </span>
            ) : (
              <button
                onClick={() => setShowEmergencyForm(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-rose-500/40"
              >
                Dispatch Roadside Help
              </button>
            )}
          </div>

          {/* Platform Status */}
          <div className="border border-slate-900 bg-slate-950/40 rounded-3xl p-6 flex flex-col justify-between h-[200px]">
            <div>
              <div className="flex items-center gap-2 text-amber-400">
                <Activity className="w-4.5 h-4.5" />
                <h4 className="text-xs font-bold tracking-widest uppercase">{t.help.platformStatus || 'Platform Status'}</h4>
              </div>
              <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                Check active service uptime status. Monitor payments gateways, Goong map routing, and SMS brokers.
              </p>
            </div>
            <a
              href="/help/status"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all text-center block border border-slate-800/80 cursor-pointer"
            >
              Platform Health Status
            </a>
          </div>

          {/* Owner hub */}
          <div className="border border-slate-900 bg-slate-950/40 rounded-3xl p-6 flex flex-col justify-between h-[200px]">
            <div>
              <div className="flex items-center gap-2 text-amber-400">
                <HeartHandshake className="w-4.5 h-4.5" />
                <h4 className="text-xs font-bold tracking-widest uppercase">{t.help.ownerSuccess || 'Host Success Hub'}</h4>
              </div>
              <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">
                Configure payout bank details, view Allianz insurance claims, download tax invoices, and revenue statements.
              </p>
            </div>
            <a
              href="/help/owner-success"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all text-center block border border-slate-800/80 cursor-pointer"
            >
              Host Success Dashboard
            </a>
          </div>
        </div>

        {/* ADMIN ANALYTICS SHORTCUT */}
        {user?.role?.toUpperCase() === 'ADMIN' && (
          <div className="mb-14 border border-amber-500/25 bg-amber-500/5 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Administrator Operations Dashboard</h4>
                <p className="text-slate-500 text-xs mt-0.5">Access support tickets logs, agent statistics, and resolution rate metrics.</p>
              </div>
            </div>
            <a
              href="/admin/support-analytics"
              className="px-6 py-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Open Operations Room
            </a>
          </div>
        )}

        {/* ============ DELIVERY TRACKER INTERACTIVE CONTAINER ============ */}
        <div id="delivery-tracking-section" className="mb-14 scroll-mt-24 space-y-5">
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-500" /> Live Vehicle Delivery Tracking
            </h3>
            <p className="text-slate-500 text-xs mt-1">If your vehicle delivery is en route, enter the Booking ID below to view Goong GPS telemetry.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={trackBookingId}
              onChange={e => setTrackBookingId(e.target.value)}
              placeholder="Enter Booking ID (e.g. BK-DEV-CAR or BK-DEV-MOTO)..."
              className="flex-1 bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50"
            />
            <button
              onClick={() => setActiveTrackingBookingId(trackBookingId.trim() || null)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-widest rounded-xl border border-slate-800 transition-all cursor-pointer"
            >
              Start Map Tracker
            </button>
          </div>

          {activeTrackingBookingId && (
            <div className="mt-4">
              <DeliveryTrackerMap bookingId={activeTrackingBookingId} />
            </div>
          )}
        </div>

        {/* ============ KNOWLEDGE TOPICS SECTION ============ */}
        <div className="border-t border-slate-900 pt-10 mb-14">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-2xl text-slate-100 uppercase tracking-wide">Help Center Articles</h2>
              <p className="text-slate-500 text-xs mt-1">Select a category below to browse operational documentation.</p>
            </div>
            {selectedCategoryId && (
              <button
                onClick={() => { setSelectedCategoryId(null); setArticles([]); }}
                className="flex items-center gap-1.5 text-xs text-amber-500 font-bold hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> All Categories
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Categories sidebar list */}
            <div className="space-y-2 lg:col-span-1">
              {catLoading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)
              ) : (
                categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500/60 text-white shadow-lg shadow-amber-950/20'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={cat.icon} className="w-4.5 h-4.5" />
                      <span className="text-xs font-bold tracking-wide">{cat.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))
              )}
            </div>

            {/* Articles core view */}
            <div className="lg:col-span-2">
              {selectedCategoryId ? (
                <div className="space-y-3">
                  {artLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)
                  ) : articles.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No articles listed in this category.</p>
                  ) : (
                    articles.map(art => (
                      <button
                        key={art.id}
                        onClick={() => setViewingArticleSlug(art.slug)}
                        className="w-full p-5 bg-[#0b0b0d] border border-slate-900 hover:border-slate-800 rounded-2xl text-left transition-all flex justify-between items-center group cursor-pointer"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{art.title}</h4>
                          <p className="text-slate-500 text-[10px] mt-1.5 line-clamp-1">{art.excerpt}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-650 group-hover:text-amber-400 transition-all ml-4" />
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-slate-900 border-dashed rounded-3xl bg-slate-950/10 text-center h-[200px]">
                  <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="text-slate-500 text-xs">Select a category on the left to read guides.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ============ SUPPORT TICKET INFLOW & MY TICKETS ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14 border-t border-slate-900 pt-10">
          
          {/* Submit ticket card */}
          <div className="lg:col-span-1 bg-[#0b0b0d] border border-slate-900 rounded-3xl p-6 flex flex-col justify-between h-[220px]">
            <div>
              <div className="flex items-center gap-2 text-amber-500">
                <Ticket className="w-4.5 h-4.5" />
                <h4 className="text-xs font-bold tracking-widest uppercase">Open Support Claim</h4>
              </div>
              <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                Direct client support pipeline. Open claims concerning invoices, KYC, contract details, or platform bugs.
              </p>
            </div>
            {ticketSuccess ? (
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Ticket Created! We respond in 24h.
              </div>
            ) : userId ? (
              <button
                onClick={() => { setTicketCategoryPreset('BOOKING'); setShowTicketForm(true); }}
                className="w-full py-3 bg-gradient-to-tr from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-amber-400/40"
              >
                Create Support Ticket
              </button>
            ) : (
              <a
                href="/auth/login"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-widest rounded-xl text-center block border border-slate-800/80 cursor-pointer"
              >
                Sign In to File Ticket
              </a>
            )}
          </div>

          {/* User Active tickets list */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-amber-500" /> Active Support Tickets
            </h4>
            <MyTicketsPanel userId={userId} />
          </div>

        </div>

        {/* ============ FAQ MODULE ============ */}
        <FaqSection />

      </div>

      {/* Global AI Concierge handles dialogue overlay */}

      {/* Article Modal Viewer */}
      <AnimatePresence>
        {viewingArticleSlug && (
          <ArticleViewer
            articleSlug={viewingArticleSlug}
            onClose={() => setViewingArticleSlug(null)}
          />
        )}
      </AnimatePresence>

      {/* Ticket claim form Modal */}
      <AnimatePresence>
        {showTicketForm && (
          <TicketForm
            initialCategory={ticketCategoryPreset}
            onClose={() => setShowTicketForm(false)}
            onSuccess={() => { setShowTicketForm(false); setTicketSuccess(true); }}
          />
        )}
      </AnimatePresence>

      {/* Emergency dispatch form Modal */}
      <AnimatePresence>
        {showEmergencyForm && (
          <EmergencyForm
            onClose={() => setShowEmergencyForm(false)}
            onSuccess={() => { setShowEmergencyForm(false); setEmergencySuccess(true); }}
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
  const t = useT();
  const [faqs, setFaqs] = useState<{ id: number; q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // Standard mock seeds for default fallback, or fetch from endpoints
    setFaqs([
      { id: 1, q: "How does LuxeWay separate Car and Motorbike ecosystems?", a: "LuxeWay maintains completely separated listing profiles, rent bookings, host requirements, and payout streams. Your car bookings and motorbike bookings will always route through separate panels." },
      { id: 2, q: "What is the cancellation and refund policy?", a: "Under LuxeWay's policy, bookings can be cancelled with a full refund up to 24 hours before the trip begins. Submit cancellations inside the self-service hub." },
      { id: 3, q: "How do I setup my host bank payouts?", a: "Hosts configure bank account transfers via Stripe Connect Express inside the Host Success Hub. LuxeWay processes payouts weekly on completed rentals." },
      { id: 4, q: "What should I do in case of vehicle breakdown or safety emergency?", a: "Go immediately to the Priority Emergency Dispatch form. Submit details, select your breakdown category, and callback phone. Our emergency dispatch team locates coordinates and dispatches roadside assistance immediately." }
    ]);
    setLoading(false);
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
      <div className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
        <p className="text-rose-450 text-xs font-semibold">{error}</p>
        <button onClick={load} className="flex items-center gap-1.5 text-amber-500 text-xs font-bold hover:underline cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <div className="border-t border-slate-900 pt-10">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
        <h2 className="font-extrabold text-2xl text-slate-100 uppercase tracking-wide">Frequently Asked Questions</h2>
        <p className="text-slate-500 text-xs mt-1">Quick answers to the most common questions.</p>
      </motion.div>
      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const id = faq.id ?? i;
          const isOpen = openId === id;
          return (
            <motion.div
              key={id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-[#0b0b0d] rounded-2xl border border-slate-900 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <span className="font-bold text-white text-xs pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
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
                    <p className="px-6 pb-5 text-slate-400 text-xs leading-relaxed border-t border-slate-900/60 pt-4">
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
