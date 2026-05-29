import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Sparkles, RefreshCw, 
  ChevronDown, Database, Bot, HelpCircle 
} from 'lucide-react';
import { chatbotService, ChatMessage } from '@/services/chatbotService';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils';

const QUICK_QUESTIONS = [
  'Tư vấn siêu xe thể thao nổi bật',
  'Xe 7 chỗ cho gia đình ở Hà Nội',
  'Tìm xe tự động dưới 2 triệu/ngày',
  'Chính sách tiền đặt cọc thế nào?'
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // 1. Check Flask server health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await chatbotService.checkChatbotHealth();
        if (res && res.status === 'healthy') {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        setIsOnline(false);
      }
    };
    
    checkHealth();
    // Periodically check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Scroll to bottom when messages or loading state changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 3. Send message handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Pass the current conversation history (excluding the new user message we just sent)
      const res = await chatbotService.sendChatMessage(text, messages);
      
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: res.reply || 'Xin lỗi, tôi không nhận được phản hồi phù hợp.' 
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      toast.error(
        'Lỗi kết nối', 
        'Không thể gửi tin nhắn đến chatbot. Vui lòng đảm bảo dịch vụ Flask đang hoạt động tại cổng 5000.'
      );
      
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: '⚠️ Hệ thống hiện đang mất kết nối với máy chủ AI. Quý khách vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Rebuild vector database (bootstrap)
  const handleSyncDatabase = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    toast.info('Đang đồng bộ', 'Đang nạp dữ liệu xe mới nhất từ cơ sở dữ liệu SQL Server...');

    try {
      const res = await chatbotService.bootstrapVectorDB();
      if (res && res.success) {
        toast.success('Đồng bộ thành công', 'Cơ sở dữ liệu Vector đã được cập nhật mượt mà!');
        setIsOnline(true);
      } else {
        toast.error('Đồng bộ thất bại', res.message || 'Không tìm thấy dữ liệu xe.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi đồng bộ', 'Không thể kết nối đến máy chủ để thực hiện đồng bộ.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to format response text (simple markdown bold & linebreaks)
  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Replace **text** with <strong>text</strong>
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      // Simple parse for bullet points
      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
      if (isBullet) {
        formattedLine = formattedLine.replace(/^[-*]\s*/, '• ');
      }

      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(formattedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(formattedLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-slate-900 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < formattedLine.length) {
        parts.push(formattedLine.substring(lastIndex));
      }

      return (
        <span key={idx} className={cn("block", isBullet ? "pl-2" : "")}>
          {parts.length > 0 ? parts : formattedLine}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] font-sans">
      <AnimatePresence>
        {/* Chat Window Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="mb-4 w-[380px] sm:w-[420px] h-[580px] rounded-[30px] border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header Area */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] px-5 py-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-wide">LuxeWay AI Assistant</h3>
                    <span className="bg-amber-400/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">RAG</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    )} />
                    <span className="text-[11px] text-slate-300 font-medium">
                      {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Sync Database Button */}
                <button
                  onClick={handleSyncDatabase}
                  disabled={isSyncing}
                  title="Đồng bộ dữ liệu xe từ SQL Server"
                  className={cn(
                    "p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all",
                    isSyncing && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin text-amber-400")} />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin">
              {/* Initial Welcome Message */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl rounded-tl-none p-3.5 max-w-[82%] text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-850">
                  Xin chào! Tôi là <strong>LuxeWay AI</strong>, trợ lý tư vấn thuê xe tự động của bạn.
                  <br /><br />
                  Tôi đã được nạp dữ liệu xe thực tế từ cơ sở dữ liệu. Bạn hãy đặt câu hỏi để tôi hỗ trợ tư vấn và so sánh các dòng xe tốt nhất nhé!
                </div>
              </div>

              {/* Message List */}
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex items-start gap-2.5", isUser ? "justify-end" : "justify-start")}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                    <div className={cn(
                      "p-3.5 rounded-2xl max-w-[82%] text-sm leading-relaxed border",
                      isUser 
                        ? "bg-[#0F172A] dark:bg-[#1E293B] text-white rounded-tr-none border-[#0F172A] dark:border-[#1E293B]" 
                        : "bg-slate-50 dark:bg-slate-900/60 text-slate-750 dark:text-slate-350 rounded-tl-none border-slate-100 dark:border-slate-800"
                    )}>
                      {isUser ? msg.content : formatMessageContent(msg.content)}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Loader Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-750">
                    <Bot className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100/60 dark:border-slate-800/40 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions chips */}
            {messages.length === 0 && !isLoading && (
              <div className="px-4 pb-3">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2 tracking-wider uppercase">
                  <HelpCircle className="w-3.5 h-3.5" /> Gợi ý câu hỏi
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 transition-all font-medium text-left hover:scale-[1.02]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input Area */}
            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex gap-2 bg-slate-50/50 dark:bg-slate-950/50">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendMessage(inputValue);
                }}
                disabled={isLoading}
                placeholder="Hỏi tôi về dòng xe, giá cả, khu vực..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-[#0F172A] dark:text-white placeholder-slate-450 dark:placeholder-slate-550 outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-60"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-slate-900 to-[#1E3A5F] dark:from-slate-850 dark:to-slate-750 flex items-center justify-center text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkly Chat Bubble Button */}
      <motion.button
        layout
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-[22px] shadow-2xl flex items-center justify-center text-white relative transition-all duration-300",
          isOpen 
            ? "bg-slate-900 hover:bg-slate-850" 
            : "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6 text-slate-950" />
              <div className="absolute -top-1.5 -right-1.5 bg-rose-500 border border-white dark:border-slate-950 w-2.5 h-2.5 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatbotWidget;
