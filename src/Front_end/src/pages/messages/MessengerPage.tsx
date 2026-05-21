import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, ArrowLeft, MoreVertical, Phone, Video, Image, Smile, Circle } from 'lucide-react';
import { useAuthStore } from '@/store';
import { messageService } from '@/services/otherServices';
import type { Conversation, Message } from '@/types';
import { formatDate, getInitials } from '@/utils';
import { getDb } from '@/mock/db';

const MessengerPage: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { users } = getDb();

  useEffect(() => {
    if (!user) return;
    messageService.getConversations(user.id).then(convs => {
      setConversations(convs);
      if (convs.length > 0) setActiveConv(convs[0]);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!activeConv) return;
    messageService.getMessages(activeConv.id).then(msgs => {
      setMessages(msgs);
    });
  }, [activeConv]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate incoming message
  const simulateReply = () => {
    const replies = [
      'Thanks for your inquiry! The vehicle is available.',
      'Sure, I can arrange delivery to your hotel.',
      'Please confirm your booking details.',
      'Great choice! You\'ll love this car.',
      'The pickup location is at our Beverly Hills office.',
    ];
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (activeConv && user) {
        const otherId = activeConv.participants.find(p => p !== user.id) || 'owner-001';
        const replyMsg: Message = {
          id: `msg-${Date.now()}`,
          conversationId: activeConv.id,
          senderId: otherId,
          receiverId: user.id,
          type: 'text',
          content: replies[Math.floor(Math.random() * replies.length)],
          createdAt: new Date().toISOString(),
          edited: false,
        };
        setMessages(prev => [...prev, replyMsg]);
      }
    }, 1500 + Math.random() * 1000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || !user) return;

    const otherId = activeConv.participants.find(p => p !== user.id) || 'owner-001';
    const msg = await messageService.sendMessage(activeConv.id, user.id, otherId, newMessage.trim());
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    setTimeout(simulateReply, 500);
  };

  const getOtherUser = (conv: Conversation) => {
    if (!user) return null;
    const otherId = conv.participants.find(p => p !== user.id);
    return users.find(u => u.id === otherId);
  };

  const filteredConvs = conversations.filter(conv => {
    const other = getOtherUser(conv);
    if (!other) return false;
    return other.displayName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)]">
        <div className="flex h-full rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-luxury my-4">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-display text-xl font-bold text-[#0F172A] mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none focus:bg-slate-100 transition-colors"
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
                <div className="text-center py-10 text-slate-400 text-sm">No conversations</div>
              ) : (
                filteredConvs.map(conv => {
                  const other = getOtherUser(conv);
                  const isActive = activeConv?.id === conv.id;
                  const unread = user ? (conv.unreadCount[user.id] || 0) : 0;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="relative">
                        {other?.avatar ? (
                          <img src={other.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover" />
                        ) : (
                          <div className="avatar w-11 h-11 rounded-2xl text-sm">{getInitials(other?.displayName || 'U')}</div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-accent' : 'text-[#0F172A]'}`}>
                            {other?.displayName || 'Unknown'}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                            {conv.lastMessage ? formatDate(conv.lastMessage.createdAt, 'relative') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
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
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {other?.avatar ? (
                        <img src={other.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                      ) : (
                        <div className="avatar w-10 h-10 rounded-2xl text-sm">{getInitials(other?.displayName || 'U')}</div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-[#0F172A]">{other?.displayName || 'User'}</p>
                        <p className="text-xs text-success flex items-center gap-1"><Circle className="w-2 h-2 fill-current" /> Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><Phone className="w-4 h-4" /></button>
                      <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><Video className="w-4 h-4" /></button>
                      <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
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
              <div className="px-5 py-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm outline-none text-[#0F172A] placeholder:text-slate-400"
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl transition-all ${newMessage.trim() ? 'bg-accent text-white hover:bg-blue-600' : 'bg-slate-200 text-slate-400'}`}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">Your messages</h3>
                <p className="text-slate-400 text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerPage;
