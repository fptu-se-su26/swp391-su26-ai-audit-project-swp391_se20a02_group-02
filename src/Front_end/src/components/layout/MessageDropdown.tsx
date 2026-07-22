import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store';
import { cn, getInitials, formatDate } from '@/utils';
import { messageService } from '@/services/otherServices';
import type { Conversation } from '@/types';
import { useT } from '@/i18n/translations';

interface MessageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessageDropdown: React.FC<MessageDropdownProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme } = useUIStore();
  const t = useT();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (user) {
        setLoading(true);
        messageService.getConversations(user.id).then(data => {
          setConversations(data.slice(0, 5)); // show top 5
          setLoading(false);
        });
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, user]);

  const handleMessageClick = () => {
    onClose();
    navigate('/messages');
  };

  const getOtherUser = (conv: Conversation) => {
    if (!user) return null;
    const otherId = conv.participants.find(p => p !== user.id);
    const profile = conv.participantProfiles?.find(p => p.id === otherId);
    return {
      id: otherId,
      displayName: profile?.displayName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.email || `User ${otherId?.substring(0, 4)}`,
      avatar: profile?.avatar,
    };
  };

  if (!user) return null;

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount[user.id] || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute right-0 mt-3.5 w-80 sm:w-96 rounded-[28px] border shadow-2xl overflow-hidden z-50 transition-colors duration-300',
            isDark
              ? 'bg-slate-950/95 border-slate-800/80 backdrop-blur-xl text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
              : 'bg-white/95 border-slate-100 backdrop-blur-xl text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
          )}
        >
          {/* Header */}
          <div className={cn('p-4 border-b flex items-center justify-between', isDark ? 'border-slate-800/80' : 'border-slate-100')}>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              {t.nav?.messages || 'Messages'}
            </h3>
            {totalUnread > 0 && (
              <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                {totalUnread} new
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-medium">No messages yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherUser(conv);
                const unread = conv.unreadCount[user.id] || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={handleMessageClick}
                    className={cn(
                      'p-3 rounded-2xl cursor-pointer transition-all duration-200 flex gap-3',
                      isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50',
                      unread > 0 ? (isDark ? 'bg-indigo-950/20' : 'bg-indigo-50/50') : ''
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      {other?.avatar ? (
                        <img src={other.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                      ) : (
                        <div className={cn(
                          'w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold',
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        )}>
                          {getInitials(other?.displayName || 'U')}
                        </div>
                      )}
                      {unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className={cn('text-sm font-bold truncate', unread > 0 ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300' : 'text-slate-700'))}>
                          {other?.displayName || 'Unknown'}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                          {conv.lastMessage ? formatDate(conv.lastMessage.createdAt, 'relative') : ''}
                        </span>
                      </div>
                      <p className={cn('text-xs truncate mt-0.5', unread > 0 ? (isDark ? 'text-slate-300' : 'text-slate-700 font-semibold') : 'text-slate-500')}>
                        {conv.lastMessage?.content || 'Started a conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={cn('p-2 border-t', isDark ? 'border-slate-800/80' : 'border-slate-100')}>
            <Link 
              to="/messages" 
              onClick={onClose}
              className={cn(
                'block w-full py-2.5 text-center text-xs font-bold rounded-xl transition-colors',
                isDark ? 'hover:bg-slate-900 text-indigo-400' : 'hover:bg-slate-50 text-indigo-600'
              )}
            >
              Open Messenger <ArrowRight className="w-3 h-3 inline-block ml-1" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageDropdown;
