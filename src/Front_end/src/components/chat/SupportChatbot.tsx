import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Bot, User } from 'lucide-react';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store';

interface ChatMessage {
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt?: string;
}

export const SupportChatbot: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exclude auth routes
  const isAuthPage = location.pathname.startsWith('/auth');

  useEffect(() => {
    let storedSessionId = localStorage.getItem('luxeway_support_session_id');
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('luxeway_support_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'ASSISTANT',
          content: 'Welcome to LuxeWay Luxury Support. I am your AI concierge. How can I assist you with your premium bookings, VNPay or Stripe payments, luxury vehicle recommendations, or rental cancellations today?'
        }
      ]);
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'USER', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.post<any>('/chat', {
        sessionId,
        message: text.trim()
      });

      if (response && response.data) {
        const botResponse = response.data;
        if (botResponse.sessionId) {
          setSessionId(botResponse.sessionId);
          localStorage.setItem('luxeway_support_session_id', botResponse.sessionId);
        }

        setMessages(prev => [
          ...prev,
          {
            role: 'ASSISTANT',
            content: botResponse.message || 'I apologize, but I could not formulate a response at this time.'
          }
        ]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Support chatbot communication failed:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'ASSISTANT',
          content: 'System error: Unable to connect to the luxury concierge network. Please check your connection and try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    { label: 'Booking help', text: 'How do I book a premium vehicle?' },
    { label: 'Payment options', text: 'What payment methods are supported?' },
    { label: 'Recommendations', text: 'Which luxury vehicles do you recommend?' },
    { label: 'Cancel & Refund', text: 'How do I cancel my booking and request a refund?' },
    { label: 'Live GPS Tracking', text: 'How do I track my active rental delivery?' }
  ];

  if (isAuthPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9990] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 225 }}
            className="mb-4 w-[380px] sm:w-[420px] h-[580px] rounded-[24px] border border-amber-500/20 bg-black/95 text-white shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-950/20 via-amber-950/5 to-transparent px-5 py-4 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/10 to-yellow-600/10 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide text-white">LuxeWay AI Concierge</h3>
                  <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block">Support Network Active</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin bg-gradient-to-b from-black to-slate-950/90">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'USER';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[82%] text-sm leading-relaxed border ${
                        isUser
                          ? 'bg-gradient-to-tr from-amber-600 to-amber-700 text-white rounded-tr-none border-amber-500/30 shadow-md shadow-amber-900/10'
                          : 'bg-slate-900/90 text-slate-200 rounded-tl-none border-slate-850'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/80">
                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 mb-2 tracking-wider uppercase">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> SUGGESTED QUESTIONS
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q.text)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900 hover:bg-amber-950/20 text-slate-350 hover:text-amber-400 hover:border-amber-500/30 transition-all font-medium text-left cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-4 bg-slate-950 border-t border-slate-900 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask our concierge anything about your trip..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 placeholder-slate-600 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-black font-bold flex items-center justify-center hover:from-amber-600 hover:to-yellow-700 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-650 border border-amber-400/30 disabled:border-slate-800 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        layout
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all cursor-pointer relative shadow-2xl ${
          isOpen
            ? 'bg-black/90 border-amber-500/40 text-amber-500'
            : 'bg-gradient-to-tr from-[#0b0b0d] via-[#16161a] to-[#25252b] border-amber-500/30 text-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]'
        }`}
      >
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
              key="sparkles"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center justify-center relative"
            >
              <MessageSquare className="w-6 h-6 text-amber-400 animate-pulse" />
              <div className="absolute top-0 right-0 bg-amber-500 w-2 h-2 rounded-full animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default SupportChatbot;
