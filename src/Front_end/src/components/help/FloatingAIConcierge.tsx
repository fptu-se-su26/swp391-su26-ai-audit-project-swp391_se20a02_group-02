import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  HelpCircle,
  MapPin,
  MessageSquare,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import { aiConciergeService } from '@/services/helpService';
import { useT } from '@/i18n/translations';
import { useAuthStore } from '@/store';
import { cn } from '@/utils';
import { DeliveryTrackerMap } from './DeliveryTrackerMap';

interface Message {
  id?: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
  actionCard?: any;
  feedbackGiven?: 'UP' | 'DOWN';
}

type OrbState = 'idle' | 'listening' | 'thinking' | 'responding';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const parseActionCard = (rawResponse?: string) => {
  if (!rawResponse || !rawResponse.includes('actionCard')) return undefined;

  try {
    return JSON.parse(rawResponse).actionCard;
  } catch {
    return undefined;
  }
};

export const FloatingAIConcierge: React.FC = () => {
  const t = useT();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeVehicleId, setActiveVehicleId] = useState<string | undefined>(undefined);
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(undefined);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const status = useMemo(() => {
    if (orbState === 'listening') return { label: 'Listening', tone: 'text-rose-300', dot: 'bg-rose-400' };
    if (orbState === 'thinking') return { label: 'Thinking', tone: 'text-amber-300', dot: 'bg-amber-400' };
    if (orbState === 'responding') return { label: 'Responding', tone: 'text-emerald-300', dot: 'bg-emerald-400' };
    if (activeBookingId) return { label: `Booking ${activeBookingId.substring(0, 8).toUpperCase()}`, tone: 'text-amber-300', dot: 'bg-amber-400' };
    if (activeVehicleId) return { label: 'Vehicle context active', tone: 'text-amber-300', dot: 'bg-amber-400' };
    return { label: 'Ready for trip support', tone: 'text-slate-400', dot: 'bg-slate-500' };
  }, [activeBookingId, activeVehicleId, orbState]);

  const quickActions = useMemo(
    () => [
      { label: 'Track delivery', text: 'Where is my car? Show me the delivery tracking simulator.', icon: MapPin },
      { label: 'Roadside help', text: 'I have a flat tire and roadside breakdown emergency.', icon: AlertTriangle },
      { label: 'Refund request', text: 'How do I cancel my trip and request a refund?', icon: ShieldCheck },
      { label: 'Host earnings', text: 'Tell me about LuxeWay Host commission and payouts.', icon: Calendar },
      { label: 'System status', text: 'Are all payment and booking systems operational?', icon: HelpCircle },
    ],
    []
  );

  useEffect(() => {
    let sid = localStorage.getItem('luxeway_ai_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('luxeway_ai_session_id', sid);
    }
    setSessionId(sid);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setInput(resultText);
        setOrbState('thinking');
        handleSend(resultText);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        setOrbState('idle');
      };

      rec.onend = () => {
        setIsListening(false);
        setOrbState(prev => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = rec;
    }

    if (user) {
      aiConciergeService
        .getPreferences()
        .then(res => {
          if (res) setIsVoiceEnabled(res.voiceEnabled || false);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const path = location.pathname;
    const carMatch = path.match(/\/cars\/([a-zA-Z0-9-]+)/);
    const bikeMatch = path.match(/\/motorbikes\/([a-zA-Z0-9-]+)/);
    const carBookingMatch = path.match(/\/car-booking\/([a-zA-Z0-9-]+)/);
    const bikeBookingMatch = path.match(/\/motorbike-booking\/([a-zA-Z0-9-]+)/);

    setActiveVehicleId(carMatch?.[1] || bikeMatch?.[1]);
    setActiveBookingId(carBookingMatch?.[1] || bikeBookingMatch?.[1]);
  }, [location]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [loading, messages, shouldReduceMotion]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;

    setLoading(true);
    aiConciergeService
      .getHistory(sessionId)
      .then(res => {
        if (res && res.length > 0) {
          setMessages(
            res.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
              actionCard: parseActionCard(m.rawResponse),
            }))
          );
          return;
        }

        setMessages([
          {
            role: 'ASSISTANT',
            content:
              t.help.aiConciergeGreeting ||
              "Greetings. Welcome to LuxeWay's VIP AI Concierge. I am fully synchronized with your active session details. How may I assist you with your premium bookings, delivery maps, roadside recoveries, or host assets today?",
            createdAt: new Date().toISOString(),
          },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, sessionId, t.help.aiConciergeGreeting]);

  const speakText = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#`_\-[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(
      v => v.name.includes('Google US English') || v.name.includes('Premium') || v.lang.startsWith('en')
    );
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.onstart = () => setOrbState('responding');
    utterance.onend = () => setOrbState('idle');
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceToggle = async () => {
    const newVal = !isVoiceEnabled;
    setIsVoiceEnabled(newVal);
    if (!newVal) {
      window.speechSynthesis.cancel();
      setOrbState('idle');
    }

    try {
      await aiConciergeService.savePreferences({
        preferredLanguage: 'en',
        voiceEnabled: newVal,
      });
    } catch {}
  };

  const startVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setOrbState('idle');
      return;
    }

    window.speechSynthesis.cancel();
    setIsListening(true);
    setOrbState('listening');
    recognitionRef.current.start();
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!textToSend) setInput('');
    setLoading(true);
    setOrbState('thinking');

    setMessages(prev => [
      ...prev,
      {
        role: 'USER',
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await aiConciergeService.chat(sessionId, text, location.pathname, activeVehicleId, activeBookingId);

      if (res) {
        setMessages(prev => [
          ...prev,
          {
            id: res.messageId,
            role: 'ASSISTANT',
            content: res.content,
            createdAt: res.createdAt || new Date().toISOString(),
            actionCard: res.actionCard,
          },
        ]);
        setOrbState('responding');
        speakText(res.content);
      }
    } catch (err) {
      console.error('AI Concierge request failed:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'ASSISTANT',
          content:
            'I am having trouble reaching the concierge network right now. Please try again shortly or open a support ticket if the matter is urgent.',
          createdAt: new Date().toISOString(),
        },
      ]);
      setOrbState('idle');
    } finally {
      setLoading(false);
      window.setTimeout(() => {
        setOrbState(prev => (prev === 'thinking' || (!isVoiceEnabled && prev === 'responding') ? 'idle' : prev));
      }, 900);
    }
  };

  const handleFeedback = async (messageIdx: number, isPositive: boolean) => {
    const msg = messages[messageIdx];
    if (!msg || !msg.id) return;

    try {
      await aiConciergeService.submitFeedback({
        sessionId,
        messageId: msg.id,
        isPositive,
        feedbackText: isPositive ? 'Positive rating' : 'Negative rating',
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[messageIdx] = {
          ...msg,
          feedbackGiven: isPositive ? 'UP' : 'DOWN',
        };
        return updated;
      });
    } catch (e) {
      console.error('Error submitting rating:', e);
    }
  };

  const renderActionCard = (msg: Message) => {
    if (!msg.actionCard) return null;

    if (msg.actionCard.action === 'CANCEL_BOOKING') {
      return (
        <ActionPanel tone="rose">
          <ActionHeader icon={AlertCircle} label="Trip cancelled" tone="rose" />
          <p className="text-xs leading-5 text-slate-300">{msg.actionCard.message}</p>
          <div className="flex items-center justify-between rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs">
            <span className="text-rose-100/80">Refund amount</span>
            <span className="font-semibold text-rose-200">${msg.actionCard.refundAmount}</span>
          </div>
        </ActionPanel>
      );
    }

    if (msg.actionCard.action === 'MODIFY_BOOKING') {
      return (
        <ActionPanel tone="emerald">
          <ActionHeader icon={CheckCircle2} label="Trip dates modified" tone="emerald" />
          <p className="text-xs leading-5 text-slate-300">{msg.actionCard.message}</p>
          <div className="space-y-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-emerald-100/80">New end date</span>
              <span className="font-semibold text-white">{msg.actionCard.newEndDate}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-emerald-400/20 pt-2">
              <span className="text-emerald-100/80">Additional cost</span>
              <span className="font-semibold text-emerald-200">+${msg.actionCard.additionalCost}</span>
            </div>
          </div>
        </ActionPanel>
      );
    }

    if (msg.actionCard.action === 'DOWNLOAD_INVOICE') {
      return (
        <ActionPanel tone="amber">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-amber-200">Billing invoice</span>
            <span className="font-mono text-slate-400">{msg.actionCard.invoiceNumber}</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <ActionRow label="Recipient" value={msg.actionCard.customerName} />
            <ActionRow label="Vehicle" value={msg.actionCard.vehicleName} />
            <ActionRow label="Duration" value={`${msg.actionCard.totalDays} Days`} />
            <ActionRow label="Total charged" value={`$${msg.actionCard.total}`} strong />
          </div>
          <a
            href={msg.actionCard.pdfUrl}
            download
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-3 text-xs font-semibold text-[#0B1221] transition duration-200 hover:bg-[#E5C158] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </a>
        </ActionPanel>
      );
    }

    if (msg.actionCard.action === 'EMERGENCY_DISPATCH') {
      return (
        <ActionPanel tone="rose">
          <ActionHeader icon={Wrench} label="Roadside dispatch active" tone="rose" />
          <p className="text-xs leading-5 text-slate-300">{msg.actionCard.message}</p>
          <a
            href="/help/emergency"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-rose-400/30 bg-rose-400/10 px-3 text-xs font-semibold text-rose-200 transition duration-200 hover:bg-rose-400/15 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            View incident dashboard
          </a>
        </ActionPanel>
      );
    }

    return null;
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
      <motion.button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border shadow-[0_18px_45px_rgba(11,18,33,0.22)] transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50',
          isOpen
            ? 'border-[#D4AF37]/45 bg-[#0B1221] text-[#D4AF37]'
            : 'border-slate-800 bg-[#0B1221] text-white hover:border-[#D4AF37]/50'
        )}
        aria-label={isOpen ? 'Close LuxeWay AI Concierge' : 'Open LuxeWay AI Concierge'}
      >
        <span className={cn('absolute right-2 top-2 h-2 w-2 rounded-full', status.dot)} />
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={shouldReduceMotion ? false : { opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 45 }}
              transition={{ duration: 0.18, ease: easeOutExpo }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key={orbState}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.2, ease: easeOutExpo }}
              className="relative"
            >
              {orbState === 'listening' ? <Mic className="h-5 w-5 text-rose-200" /> : <Sparkles className="h-5 w-5" />}
            </motion.span>
          )}
        </AnimatePresence>
        {orbState !== 'idle' && !shouldReduceMotion && (
          <motion.span
            className="absolute inset-1 rounded-md border border-[#D4AF37]/30"
            animate={{ opacity: [0.25, 0.75, 0.25], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: easeOutExpo }}
            className="absolute bottom-16 right-0 flex h-[min(680px,calc(100vh-7rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#0B1221] text-white shadow-[0_26px_80px_rgba(2,6,23,0.42)]"
            aria-label="LuxeWay AI Concierge chat"
          >
            <header className="border-b border-slate-800 bg-[#101A2D] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#D4AF37]/25 bg-[#D4AF37]/10">
                    <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold tracking-normal text-white">LuxeWay AI Concierge</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                      <span className={cn('truncate text-[11px] font-medium', status.tone)}>{status.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    title={isVoiceEnabled ? 'Mute spoken responses' : 'Read responses aloud'}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-md border transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40',
                      isVoiceEnabled
                        ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                    )}
                  >
                    {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 transition duration-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
                    aria-label="Close concierge"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[#0B1221] px-4 py-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'USER';

                  return (
                    <motion.div
                      key={`${msg.createdAt}-${idx}`}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: easeOutExpo }}
                      className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[88%] rounded-lg border px-3.5 py-3 text-sm leading-6 shadow-sm',
                          isUser
                            ? 'border-[#D4AF37]/25 bg-[#D4AF37] text-[#0B1221]'
                            : 'border-slate-800 bg-[#111B2E] text-slate-100'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        {!isUser && msg.id && (
                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-800 pt-2 text-[11px] text-slate-400">
                            <span>Helpful?</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleFeedback(idx, true)}
                                disabled={!!msg.feedbackGiven}
                                className={cn(
                                  'rounded-md p-1.5 transition duration-150 hover:bg-slate-800 disabled:cursor-default disabled:opacity-70',
                                  msg.feedbackGiven === 'UP' ? 'text-[#D4AF37]' : 'text-slate-400'
                                )}
                                aria-label="Mark response helpful"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(idx, false)}
                                disabled={!!msg.feedbackGiven}
                                className={cn(
                                  'rounded-md p-1.5 transition duration-150 hover:bg-slate-800 disabled:cursor-default disabled:opacity-70',
                                  msg.feedbackGiven === 'DOWN' ? 'text-rose-300' : 'text-slate-400'
                                )}
                                aria-label="Mark response not helpful"
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {!isUser && renderActionCard(msg)}

                      {!isUser && msg.content.includes('GPS') && activeBookingId && (
                        <div className="w-full overflow-hidden rounded-lg border border-slate-800">
                          <DeliveryTrackerMap bookingId={activeBookingId} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {loading && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#111B2E] px-3.5 py-3 text-xs text-slate-400">
                      <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>Concierge is composing</span>
                      <span className="flex items-center gap-1" aria-hidden="true">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
                            animate={shouldReduceMotion ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                            transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-slate-800 bg-[#101A2D] px-4 py-3">
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
                {quickActions.map(action => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleSend(action.text)}
                      disabled={loading}
                      className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-300 transition duration-200 hover:border-[#D4AF37]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#D4AF37]" />
                      {action.label}
                    </button>
                  );
                })}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={startVoiceListening}
                  title="Dictate message"
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40',
                    isListening
                      ? 'border-rose-400/50 bg-rose-400/10 text-rose-200'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                  )}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about bookings, delivery, refunds..."
                    disabled={loading}
                    className="h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 pr-9 text-sm text-white outline-none transition duration-200 placeholder:text-slate-500 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/15 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#D4AF37]/40 bg-[#D4AF37] text-[#0B1221] transition duration-200 hover:bg-[#E5C158] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-600"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionPanel: React.FC<{ tone: 'amber' | 'emerald' | 'rose'; children: React.ReactNode }> = ({ tone, children }) => (
  <div
    className={cn(
      'w-[92%] space-y-3 rounded-lg border p-3.5 shadow-sm',
      tone === 'amber' && 'border-[#D4AF37]/25 bg-[#D4AF37]/10',
      tone === 'emerald' && 'border-emerald-400/20 bg-emerald-400/10',
      tone === 'rose' && 'border-rose-400/20 bg-rose-400/10'
    )}
  >
    {children}
  </div>
);

const ActionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: 'emerald' | 'rose';
}> = ({ icon: Icon, label, tone }) => (
  <div
    className={cn(
      'flex items-center gap-2 text-xs font-semibold',
      tone === 'emerald' ? 'text-emerald-200' : 'text-rose-200'
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </div>
);

const ActionRow: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
    <span className="text-slate-400">{label}</span>
    <span className={cn('truncate text-right', strong ? 'font-semibold text-white' : 'text-slate-200')}>{value}</span>
  </div>
);
