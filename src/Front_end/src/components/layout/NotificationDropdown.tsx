import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore, useNotificationStore } from '@/store';
import { cn } from '@/utils';
import { notificationService } from '@/services/otherServices';
import type { Notification } from '@/types';
import { useT, translateNotification } from '@/i18n/translations';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme } = useUIStore();
  const t = useT();
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
        notificationService.getByUser(user.id).then(data => {
          setNotifications(data.slice(0, 5)); // show top 5
          setLoading(false);
        });
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, user]);

  const markRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleNotificationClick = (n: Notification) => {
    notificationService.markRead(n.id).then(() => {
      // Refresh the unread count from backend for accuracy
      notificationService.getUnreadCount().then(setUnreadCount);
    });
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    onClose();
    // Navigate to the notification-specific link, fallback to /notifications
    const target = n.link && n.link.trim() ? n.link.trim() : '/notifications';
    navigate(target);
  };

  if (!user) return null;

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
              <Bell className="w-4 h-4 text-indigo-500" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); notificationService.markAllRead(user.id); setNotifications(prev => prev.map(n => ({...n, read: true}))); setUnreadCount(0); }}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'p-3 rounded-2xl cursor-pointer transition-all duration-200 flex gap-3',
                    isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50',
                    !n.read ? (isDark ? 'bg-indigo-950/20' : 'bg-indigo-50/50') : ''
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                    !n.read ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  )}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-bold truncate', !n.read ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300' : 'text-slate-600'))}>
                      {translateNotification(n.title)}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {translateNotification(n.body)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={cn('p-2 border-t', isDark ? 'border-slate-800/80' : 'border-slate-100')}>
            <Link 
              to="/notifications" 
              onClick={onClose}
              className={cn(
                'block w-full py-2.5 text-center text-xs font-bold rounded-xl transition-colors',
                isDark ? 'hover:bg-slate-900 text-indigo-400' : 'hover:bg-slate-50 text-indigo-600'
              )}
            >
              View all notifications <ArrowRight className="w-3 h-3 inline-block ml-1" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
