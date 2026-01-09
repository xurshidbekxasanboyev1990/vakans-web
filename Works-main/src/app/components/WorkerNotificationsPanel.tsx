import { useState, useEffect } from 'react';
import { Bell, Check, X, Briefcase, UserCheck, Clock, Trash2, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

export interface WorkerNotification {
  id: string;
  type: 'application' | 'job_status' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
}

interface WorkerNotificationsPanelProps {
  workerId: string;
}

export function WorkerNotificationsPanel({ workerId }: WorkerNotificationsPanelProps) {
  const [notifications, setNotifications] = useState<WorkerNotification[]>([]);
  const [open, setOpen] = useState(false);

  const notificationsKey = `worker_notifications_${workerId}`;

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem(notificationsKey);
      setNotifications(saved ? JSON.parse(saved) : []);
    };

    loadNotifications();
    
    // Poll for new notifications every 3 seconds
    const interval = setInterval(loadNotifications, 3000);
    
    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === notificationsKey) {
        loadNotifications();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [notificationsKey]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(notificationsKey, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(notificationsKey, JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(notificationsKey, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem(notificationsKey, JSON.stringify([]));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hozirgina';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    return date.toLocaleDateString('uz-UZ');
  };

  const getIcon = (type: WorkerNotification['type']) => {
    switch (type) {
      case 'application':
        return <UserCheck className="w-4 h-4" />;
      case 'job_status':
        return <Briefcase className="w-4 h-4" />;
      case 'message':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: WorkerNotification['type']) => {
    switch (type) {
      case 'application':
        return 'bg-green-500';
      case 'job_status':
        return 'bg-blue-500';
      case 'message':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Bildirishnomalar"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[380px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {unreadCount} yangi
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2 text-xs text-gray-500 hover:text-blue-600"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Barchasini o'qilgan deb belgilash
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">
                Hali bildirishnomalar yo'q
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Yangi xabarlar bu yerda ko'rinadi
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    relative p-4 transition-colors cursor-pointer
                    ${notification.read 
                      ? 'bg-white dark:bg-gray-900' 
                      : 'bg-blue-50/50 dark:bg-blue-900/10'
                    }
                    hover:bg-gray-50 dark:hover:bg-gray-800/50
                  `}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white
                      ${getIconBg(notification.type)}
                    `}>
                      {getIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      title="O'chirish"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="w-full h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Barchasini o'chirish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
