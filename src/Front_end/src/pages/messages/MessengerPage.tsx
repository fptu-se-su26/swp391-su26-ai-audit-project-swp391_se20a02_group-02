import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Send, Search, MoreVertical, Phone, Video, Image, Smile, Circle } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { messageService } from '@/services/otherServices';
import { useT } from '@/i18n/translations';
import type { Conversation, Message } from '@/types';
import { formatDate, getInitials } from '@/utils';
import { cn, WS_URL } from '@/utils';
import SockJS from 'sockjs-client';

const MessengerPage: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { theme } = useUIStore();
  const t = useT();
  const isDark = theme === 'dark';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    const ownerId = params.get('ownerId');
    const vehicleId = params.get('vehicleId') || undefined;

    const load = async () => {
      setLoading(true);
      let convs = await messageService.getConversations(user.id);
      if (ownerId && ownerId !== user.id) {
        const created = await messageService.createConversation(user.id, ownerId, vehicleId);
        convs = [created, ...convs.filter(c => c.id !== created.id)];
        setActiveConv(created);
      } else if (convs.length > 0) {
        setActiveConv(convs[0]);
      }
      setConversations(convs);
      setLoading(false);
    };

    load().catch(err => {
      console.error('Failed to initialize messenger', err);
      setLoading(false);
    });
  }, [user, location.search]);

  useEffect(() => {
    if (!activeConv) return;
    
    // Fetch initial messages history
    messageService.getMessages(activeConv.id).then(msgs => {
      setMessages(msgs);
    });

    // Establish WebSocket Connection via native SockJS + STOMP frames (no stompjs)
    let ws: WebSocket | null = null;
    let subscribed = false;
    try {
      ws = new SockJS(WS_URL) as unknown as WebSocket;
      wsRef.current = ws;

      ws.onopen = () => {
        ws!.send('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\0');
      };

      ws.onmessage = (event: MessageEvent) => {
        const data: string = typeof event.data === 'string' ? event.data : '';
        if (!data) return;
        if (data.startsWith('CONNECTED') && !subscribed) {
          subscribed = true;
          ws!.send(`SUBSCRIBE\nid:sub-chat\ndestination:/topic/chat/${activeConv.id}\n\n\0`);
        }
        if (data.startsWith('MESSAGE')) {
          try {
            const bodyStart = data.indexOf('\n\n');
            if (bodyStart !== -1) {
              const body = data.substring(bodyStart + 2).replace(/\0$/, '');
              const msg: Message = JSON.parse(body);
              setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
          } catch (parseErr) {
            console.warn('Failed to parse STOMP message body:', parseErr);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
      };
    } catch (wsErr) {
      console.warn('Failed to instantiate WebSocket client:', wsErr);
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send('DISCONNECT\n\n\0'); } catch {}
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || !user) return;
    const otherId = activeConv.participants.find(p => p !== user.id) || 'owner-001';
    
    try {
      const msg = await messageService.sendMessage(activeConv.id, user.id, otherId, newMessage.trim());
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to dispatch message', error);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    if (!user) return null;
    const otherId = conv.participants.find(p => p !== user.id);
    const profile = conv.participantProfiles?.find(p => p.id === otherId);
    return {
      id: otherId,
      displayName: profile?.displayName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.email || `User ${otherId?.substring(0, 4)}`,
      avatar: profile?.avatar,
      email: profile?.email,
      role: profile?.role,
    };
  };

  const filteredConvs = conversations.filter(conv => {
    const other = getOtherUser(conv);
    if (!other) return false;
    return other.displayName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={cn('min-h-screen pt-20', isDark ? 'bg-slate-900' : 'bg-[#F8FAFC]')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)]">
        <div className={cn(
          'flex h-full rounded-3xl overflow-hidden border shadow-luxury my-4',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          {/* Sidebar */}
          <div className={cn('w-80 flex-shrink-0 border-r flex flex-col', isDark ? 'border-slate-700' : 'border-slate-100')}>
            {/* Header */}
            <div className={cn('p-5 border-b', isDark ? 'border-slate-700' : 'border-slate-100')}>
              <h2 className={cn('font-display text-xl font-bold mb-3', isDark ? 'text-white' : 'text-[#0F172A]')}>
                {t.nav.messages}
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t.common.search}
                  className={cn(
                    'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors',
                    isDark
                      ? 'bg-slate-700 text-slate-200 placeholder:text-slate-500 focus:bg-slate-600'
                      : 'bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-slate-100'
                  )}
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-2">
                      <div className="skeleton w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-4 w-32" />
                        <div className="skeleton h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className={cn('text-center py-10 text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  {t.common.noData}
                </div>
              ) : (
                filteredConvs.map(conv => {
                  const other = getOtherUser(conv);
                  const isActive = activeConv?.id === conv.id;
                  const unread = user ? (conv.unreadCount[user.id] || 0) : 0;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 text-left transition-colors',
                        isActive
                          ? isDark ? 'bg-blue-900/40' : 'bg-blue-50'
                          : isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="relative">
                        {other?.avatar ? (
                          <img src={other.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover" />
                        ) : (
                          <div className="avatar w-11 h-11 rounded-2xl text-sm">{getInitials(other?.displayName || 'U')}</div>
                        )}
                        <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2', isDark ? 'border-slate-800' : 'border-white')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className={cn('text-sm font-semibold truncate', isActive ? 'text-accent' : isDark ? 'text-slate-200' : 'text-[#0F172A]')}>
                            {other?.displayName || 'Unknown'}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                            {conv.lastMessage ? formatDate(conv.lastMessage.createdAt, 'relative') : ''}
                          </span>
                        </div>
                        <p className={cn('text-xs truncate mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          {conv.lastMessage?.content || 'Start a conversation'}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          {activeConv ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              {(() => {
                const other = getOtherUser(activeConv);
                return (
                  <div className={cn('flex items-center justify-between px-5 py-4 border-b', isDark ? 'border-slate-700' : 'border-slate-100')}>
                    <div className="flex items-center gap-3">
                      {other?.avatar ? (
                        <img src={other.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                      ) : (
                        <div className="avatar w-10 h-10 rounded-2xl text-sm">{getInitials(other?.displayName || 'U')}</div>
                      )}
                      <div>
                        <p className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-[#0F172A]')}>{other?.displayName || 'User'}</p>
                        <p className="text-xs text-success flex items-center gap-1"><Circle className="w-2 h-2 fill-current" /> Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={cn('p-2 rounded-xl transition-colors', isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100')}><Phone className="w-4 h-4" /></button>
                      <button className={cn('p-2 rounded-xl transition-colors', isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100')}><Video className="w-4 h-4" /></button>
                      <button className={cn('p-2 rounded-xl transition-colors', isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100')}><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className={cn('flex-1 overflow-y-auto p-5 space-y-3', isDark ? 'bg-slate-900/50' : '')}>
                <AnimatePresence>
                  {messages.map(msg => {
                    const isSent = msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-xs">
                          <div className={isSent ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] text-slate-400 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                            {formatDate(msg.createdAt, 'relative')}
                            {isSent && msg.readAt && ' · Read'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="chat-bubble-received flex items-center gap-1 px-4 py-3">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={cn('px-5 py-4 border-t', isDark ? 'border-slate-700' : 'border-slate-100')}>
                <div className={cn('flex items-center gap-3 p-3 rounded-2xl', isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                  <button className={cn('p-1.5 rounded-xl transition-colors', isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')}>
                    <Image className="w-4 h-4" />
                  </button>
                  <button className={cn('p-1.5 rounded-xl transition-colors', isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600')}>
                    <Smile className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className={cn('flex-1 bg-transparent text-sm outline-none', isDark ? 'text-slate-200 placeholder:text-slate-500' : 'text-[#0F172A] placeholder:text-slate-400')}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl transition-all ${newMessage.trim() ? 'bg-accent text-white hover:bg-blue-600' : isDark ? 'bg-slate-600 text-slate-400' : 'bg-slate-200 text-slate-400'}`}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className={cn('w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
                  <Send className={cn('w-8 h-8', isDark ? 'text-slate-500' : 'text-slate-300')} />
                </div>
                <h3 className={cn('font-display text-xl font-bold mb-2', isDark ? 'text-white' : 'text-[#0F172A]')}>{t.nav.messages}</h3>
                <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerPage;
