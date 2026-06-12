import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, MapPin, AlertTriangle, ShieldCheck,
  HelpCircle, ArrowRight, Mic, Volume2, VolumeX, ThumbsUp, ThumbsDown,
  Download, AlertCircle, Wrench, Calendar, CheckCircle2, ChevronRight
} from 'lucide-react';
import { aiConciergeService } from '@/services/helpService';
import { useT } from '@/i18n/translations';
import { useAuthStore } from '@/store';
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

export const FloatingAIConcierge: React.FC = () => {
  const t = useT();
  const location = useLocation();
  const { user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Context derived from current URL
  const [activeVehicleId, setActiveVehicleId] = useState<string | undefined>(undefined);
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(undefined);

  // Orb UI state
  const [orbState, setOrbState] = useState<OrbState>('idle');

  // Voice States
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Retrieve or generate session
  useEffect(() => {
    let sid = localStorage.getItem('luxeway_ai_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('luxeway_ai_session_id', sid);
    }
    setSessionId(sid);

    // Initialize Speech Recognition
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
        console.error("Speech recognition error:", e);
        setIsListening(false);
        setOrbState('idle');
      };

      rec.onend = () => {
        setIsListening(false);
        if (orbState === 'listening') {
          setOrbState('idle');
        }
      };

      recognitionRef.current = rec;
    }

    // Load AI user preferences on start
    aiConciergeService.getPreferences()
      .then(res => {
        if (res) {
          setIsVoiceEnabled(res.voiceEnabled || false);
        }
      })
      .catch(() => {});
  }, []);

  // Parse path shifts to resolve context IDs
  useEffect(() => {
    const path = location.pathname;

    let resolvedVehicleId: string | undefined = undefined;
    let resolvedBookingId: string | undefined = undefined;

    // Check cars
    const carMatch = path.match(/\/cars\/([a-zA-Z0-9-]+)/);
    if (carMatch) resolvedVehicleId = carMatch[1];

    // Check motorbikes
    const bikeMatch = path.match(/\/motorbikes\/([a-zA-Z0-9-]+)/);
    if (bikeMatch) resolvedVehicleId = bikeMatch[1];

    // Check bookings
    const carBookingMatch = path.match(/\/car-booking\/([a-zA-Z0-9-]+)/);
    if (carBookingMatch) resolvedBookingId = carBookingMatch[1];

    const bikeBookingMatch = path.match(/\/motorbike-booking\/([a-zA-Z0-9-]+)/);
    if (bikeBookingMatch) resolvedBookingId = bikeBookingMatch[1];

    setActiveVehicleId(resolvedVehicleId);
    setActiveBookingId(resolvedBookingId);
  }, [location]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat history if opened
  useEffect(() => {
    if (isOpen && sessionId) {
      setLoading(true);
      aiConciergeService.getHistory(sessionId)
        .then(res => {
          if (res && res.length > 0) {
            setMessages(res.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
              actionCard: m.rawResponse && m.rawResponse.includes("actionCard") ? JSON.parse(m.rawResponse).actionCard : undefined
            })));
          } else {
            setMessages([
              {
                role: 'ASSISTANT',
                content: t.help.aiConciergeGreeting || "Greetings. Welcome to LuxeWay's VIP AI Concierge. I am fully synchronized with your active session details. How may I assist you with your premium bookings, delivery maps, roadside recoveries, or host assets today?",
                createdAt: new Date().toISOString()
              }
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, sessionId, t.help.aiConciergeGreeting]);

  // Speak response out loud
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#`_\-\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Premium") || v.lang.startsWith("en"));
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
    // Update preferences in DB
    try {
      await aiConciergeService.savePreferences({
        preferredLanguage: 'en',
        voiceEnabled: newVal
      });
    } catch (e) {}
  };

  const startVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setOrbState('idle');
    } else {
      window.speechSynthesis.cancel();
      setIsListening(true);
      setOrbState('listening');
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!textToSend) setInput('');
    setLoading(true);
    setOrbState('thinking');

    // Add user message locally
    const userMsg: Message = {
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await aiConciergeService.chat(
        sessionId,
        text,
        location.pathname,
        activeVehicleId,
        activeBookingId
      );

      if (res) {
        const reply: Message = {
          id: res.messageId,
          role: 'ASSISTANT',
          content: res.content,
          createdAt: res.createdAt || new Date().toISOString(),
          actionCard: res.actionCard
        };
        setMessages(prev => [...prev, reply]);
        setOrbState('responding');
        speakText(res.content);
      }
    } catch (err) {
      console.error("AI Concierge request failed:", err);
      const errReply: Message = {
        role: 'ASSISTANT',
        content: "I apologize, but I am experiencing temporary difficulties connecting to our VIP generative network. Please try again shortly.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errReply]);
      setOrbState('idle');
    } finally {
      setLoading(false);
      // Let responding animation complete or fallback to idle
      setTimeout(() => {
        setOrbState(prev => prev === 'responding' ? 'responding' : 'idle');
      }, 500);
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
        feedbackText: isPositive ? "Positive rating" : "Negative rating"
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[messageIdx] = {
          ...msg,
          feedbackGiven: isPositive ? 'UP' : 'DOWN'
        };
        return updated;
      });
    } catch (e) {
      console.error("Error submitting rating:", e);
    }
  };

  const quickActions = [
    { label: "🗺️ Track Delivery", text: "Where is my car? Show me the delivery tracking simulator." },
    { label: "🚨 Roadside Emergency", text: "I have a flat tire and roadside breakdown emergency!" },
    { label: "💸 Request Refund", text: "How do I cancel my trip and request a refund?" },
    { label: "📈 Host Earnings", text: "Tell me about LuxeWay Host commission and Stripe payouts." },
    { label: "🟢 System Status", text: "Are all payment and booking status systems operational?" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Gold/Black Orb Trigger */}
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all cursor-pointer relative shadow-2xl ${
            isOpen 
              ? 'bg-black/90 border-amber-500/40 text-amber-500' 
              : 'bg-gradient-to-tr from-[#0b0b0d] via-[#16161a] to-[#25252b] border-amber-500/30 text-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]'
          }`}
        >
          {/* Wave ripple rings (when listening) */}
          {orbState === 'listening' && (
            <>
              <span className="absolute inset-0 rounded-full border border-amber-500/60 animate-ping opacity-75" />
              <span className="absolute -inset-2 rounded-full border border-amber-500/30 animate-ping opacity-40" />
            </>
          )}

          {/* Rotating particle ring (when thinking) */}
          {orbState === 'thinking' && (
            <div className="absolute inset-0 rounded-full border-t border-b border-amber-400 animate-spin" style={{ animationDuration: '1s' }} />
          )}

          {/* Flowing golden gradient glow (when responding) */}
          {orbState === 'responding' && (
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
          )}

          {/* Inner orb visual representation */}
          <div className="relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="orb"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center justify-center"
                >
                  {orbState === 'listening' ? (
                    <Mic className="w-6 h-6 animate-pulse text-amber-500" />
                  ) : (
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>

      {/* Luxury Dialog Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="absolute bottom-20 right-0 w-[440px] max-w-[92vw] h-[640px] rounded-[28px] border border-amber-500/20 bg-black/95 backdrop-blur-xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-sans"
          >
            {/* Elegant Header */}
            <div className="px-6 py-4 bg-gradient-to-b from-amber-950/20 via-amber-950/5 to-transparent border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/10 to-yellow-600/10 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className={`w-5 h-5 text-amber-400 ${orbState === 'thinking' ? 'animate-spin' : 'animate-pulse'}`} />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm tracking-wide flex items-center gap-1.5">
                    LuxeWay Virtual Concierge
                  </h3>
                  {activeBookingId ? (
                    <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block">
                      Active Booking Context: {activeBookingId.substring(0, 8).toUpperCase()}
                    </span>
                  ) : activeVehicleId ? (
                    <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block">
                      Viewing Vehicle Details Context
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">
                      Global Portal Assistance
                    </span>
                  )}
                </div>
              </div>

              {/* Toggles Panel */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceToggle}
                  title={isVoiceEnabled ? "Mute TTS response" : "Read responses aloud"}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    isVoiceEnabled
                      ? 'bg-amber-500/10 border-amber-400 text-amber-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 flex flex-col bg-gradient-to-b from-black to-slate-950/90">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'} space-y-1`}>
                  {/* Dialogue Bubble */}
                  <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                    msg.role === 'USER'
                      ? 'bg-gradient-to-tr from-amber-600 to-amber-700 text-white rounded-br-none border-amber-500/30 shadow-md shadow-amber-900/10'
                      : 'bg-slate-900/90 text-slate-200 border-slate-850 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Feedback Rating Panel for AI messages */}
                    {msg.role === 'ASSISTANT' && msg.id && (
                      <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Was this helpful?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(idx, true)}
                            disabled={!!msg.feedbackGiven}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${msg.feedbackGiven === 'UP' ? 'text-amber-400' : 'text-slate-500'}`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(idx, false)}
                            disabled={!!msg.feedbackGiven}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${msg.feedbackGiven === 'DOWN' ? 'text-rose-400' : 'text-slate-500'}`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rich Action UI Cards Render */}
                  {msg.role === 'ASSISTANT' && msg.actionCard && (
                    <div className="w-[95%] mt-2">
                      {/* 1. CANCEL BOOKING CARD */}
                      {msg.actionCard.action === 'CANCEL_BOOKING' && (
                        <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4" />
                            <span>Trip Cancelled</span>
                          </div>
                          <p className="text-slate-300 text-xs">{msg.actionCard.message}</p>
                          <div className="bg-slate-900/40 p-2.5 border border-slate-850 rounded-xl flex justify-between text-xs font-mono">
                            <span className="text-slate-500">Refund Amount</span>
                            <span className="text-rose-400 font-bold">${msg.actionCard.refundAmount}</span>
                          </div>
                        </div>
                      )}

                      {/* 2. MODIFY DATES CARD */}
                      {msg.actionCard.action === 'MODIFY_BOOKING' && (
                        <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Trip Dates Modified</span>
                          </div>
                          <p className="text-slate-300 text-xs">{msg.actionCard.message}</p>
                          <div className="bg-slate-900/40 p-2.5 border border-slate-850 rounded-xl space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">New End Date</span>
                              <span className="text-white font-bold">{msg.actionCard.newEndDate}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                              <span className="text-slate-500">Additional Cost</span>
                              <span className="text-emerald-400 font-bold">+${msg.actionCard.additionalCost}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. DOWNLOAD INVOICE CARD */}
                      {msg.actionCard.action === 'DOWNLOAD_INVOICE' && (
                        <div className="p-4 border border-amber-500/20 bg-slate-900/60 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-amber-400 font-extrabold tracking-wider uppercase">Billing Invoice</span>
                            <span className="text-slate-500 font-mono">{msg.actionCard.invoiceNumber}</span>
                          </div>
                          <div className="space-y-1.5 text-xs font-mono text-slate-300">
                            <div className="flex justify-between"><span className="text-slate-500">Recipient</span><span>{msg.actionCard.customerName}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Vehicle</span><span>{msg.actionCard.vehicleName}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Duration</span><span>{msg.actionCard.totalDays} Days</span></div>
                            <div className="flex justify-between border-t border-slate-800/80 pt-1.5"><span className="text-slate-500">Total Charged</span><span className="text-white font-bold">${msg.actionCard.total}</span></div>
                          </div>
                          <a
                            href={msg.actionCard.pdfUrl}
                            download
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-[11px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </a>
                        </div>
                      )}

                      {/* 4. EMERGENCY DISPATCH CARD */}
                      {msg.actionCard.action === 'EMERGENCY_DISPATCH' && (
                        <div className="p-4 border border-rose-500/30 bg-rose-500/5 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider animate-pulse">
                            <Wrench className="w-4 h-4" />
                            <span>Roadside Dispatch Active</span>
                          </div>
                          <p className="text-slate-350 text-xs">{msg.actionCard.message}</p>
                          <a
                            href="/help/emergency"
                            className="w-full py-2 bg-rose-950/40 hover:bg-rose-950 border border-rose-500/40 text-rose-400 font-bold text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> View Incident Dashboard
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INLINE DELIVERY TRACKING MAPS INTEGRATION */}
                  {msg.role === 'ASSISTANT' && msg.content.includes("GPS") && activeBookingId && (
                    <div className="w-full mt-3 rounded-2xl overflow-hidden shadow-lg border border-slate-900">
                      <DeliveryTrackerMap bookingId={activeBookingId} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Response Loading Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Ribbon */}
            <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
              {quickActions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(act.text)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-amber-950/20 text-slate-300 hover:text-amber-400 border border-slate-850 hover:border-amber-500/30 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  {act.label}
                </button>
              ))}
            </div>

            {/* Input Message Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 bg-slate-950 border-t border-slate-900 flex gap-2 items-center"
            >
              {/* Mic Dictate Trigger */}
              <button
                type="button"
                onClick={startVoiceListening}
                title="Dictate message"
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask our concierge anything about your trip..."
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 placeholder-slate-600 transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-black font-bold flex items-center justify-center hover:from-amber-600 hover:to-yellow-700 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-650 border border-amber-400/30 disabled:border-slate-800 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
