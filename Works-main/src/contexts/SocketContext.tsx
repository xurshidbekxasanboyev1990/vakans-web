import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// ============================================
// TYPES
// ============================================
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt?: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsersCount: number;
  
  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Chat
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, message: string, receiverId: string) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  
  // Jobs
  watchJob: (jobId: string) => void;
  unwatchJob: (jobId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

// ============================================
// PROVIDER
// ============================================
interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (!token) {
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
    });

    // Online users count
    newSocket.on('users:count', (count: number) => {
      setOnlineUsersCount(count);
    });

    // Notifications
    newSocket.on('notification:new', (notification: Notification) => {
      console.log('📢 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotificationsCount(prev => prev + 1);
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.svg',
        });
      }
    });

    newSocket.on('notification:updated', ({ id, isRead }: { id: string; isRead: boolean }) => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead } : n)
      );
      if (isRead) {
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      }
    });

    newSocket.on('notification:allRead', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
    });

    setSocket(newSocket);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((id: string) => {
    socket?.emit('notification:read', id);
  }, [socket]);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(() => {
    socket?.emit('notification:readAll');
  }, [socket]);

  // Join chat room
  const joinChat = useCallback((chatId: string) => {
    socket?.emit('chat:join', chatId);
  }, [socket]);

  // Leave chat room
  const leaveChat = useCallback((chatId: string) => {
    socket?.emit('chat:leave', chatId);
  }, [socket]);

  // Send message
  const sendMessage = useCallback((chatId: string, message: string, receiverId: string) => {
    socket?.emit('chat:message', { chatId, message, receiverId });
  }, [socket]);

  // Set typing status
  const setTyping = useCallback((chatId: string, isTyping: boolean) => {
    socket?.emit('chat:typing', { chatId, isTyping });
  }, [socket]);

  // Watch job for updates
  const watchJob = useCallback((jobId: string) => {
    socket?.emit('job:watch', jobId);
  }, [socket]);

  // Unwatch job
  const unwatchJob = useCallback((jobId: string) => {
    socket?.emit('job:unwatch', jobId);
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsersCount,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    joinChat,
    leaveChat,
    sendMessage,
    setTyping,
    watchJob,
    unwatchJob,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}

// Hook for real-time notifications
export function useNotifications() {
  const { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead } = useSocket();
  return { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead };
}

// Hook for real-time chat
export function useChat(chatId?: string) {
  const { socket, joinChat, leaveChat, sendMessage, setTyping } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ odemonger: string; userName: string }[]>([]);

  useEffect(() => {
    if (!socket || !chatId) return;

    joinChat(chatId);

    const handleMessage = (message: ChatMessage) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTyping = (data: { odemonger: string; userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          if (prev.find(u => u.odemonger === data.odemonger)) return prev;
          return [...prev, { odemonger: data.odemonger, userName: data.userName }];
        });
      } else {
        setTypingUsers(prev => prev.filter(u => u.odemonger !== data.odemonger));
      }
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      leaveChat(chatId);
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, chatId, joinChat, leaveChat]);

  const send = useCallback((message: string, receiverId: string) => {
    if (chatId) {
      sendMessage(chatId, message, receiverId);
    }
  }, [chatId, sendMessage]);

  const startTyping = useCallback(() => {
    if (chatId) setTyping(chatId, true);
  }, [chatId, setTyping]);

  const stopTyping = useCallback(() => {
    if (chatId) setTyping(chatId, false);
  }, [chatId, setTyping]);

  return { messages, typingUsers, send, startTyping, stopTyping };
}

// Hook for real-time job updates
export function useJobUpdates(jobId?: string) {
  const { socket, watchJob, unwatchJob } = useSocket();
  const [jobUpdate, setJobUpdate] = useState<any>(null);

  useEffect(() => {
    if (!socket || !jobId) return;

    watchJob(jobId);

    const handleUpdate = (data: any) => {
      setJobUpdate(data);
    };

    const handleDelete = (data: { jobId: string }) => {
      if (data.jobId === jobId) {
        setJobUpdate({ type: 'deleted', jobId });
      }
    };

    socket.on('job:update', handleUpdate);
    socket.on('job:delete', handleDelete);

    return () => {
      unwatchJob(jobId);
      socket.off('job:update', handleUpdate);
      socket.off('job:delete', handleDelete);
    };
  }, [socket, jobId, watchJob, unwatchJob]);

  return jobUpdate;
}

// Hook for new job notifications (for workers)
export function useNewJobs() {
  const { socket } = useSocket();
  const [newJobs, setNewJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewJob = (job: any) => {
      setNewJobs(prev => [job, ...prev].slice(0, 10));
    };

    socket.on('job:new', handleNewJob);

    return () => {
      socket.off('job:new', handleNewJob);
    };
  }, [socket]);

  const clearNewJobs = useCallback(() => {
    setNewJobs([]);
  }, []);

  return { newJobs, clearNewJobs };
}

// Hook for application updates
export function useApplicationUpdates() {
  const { socket } = useSocket();
  const [applicationUpdate, setApplicationUpdate] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewApplication = (data: any) => {
      setApplicationUpdate({ type: 'new', ...data });
    };

    const handleStatusChange = (data: any) => {
      setApplicationUpdate({ type: 'status', ...data });
    };

    socket.on('application:new', handleNewApplication);
    socket.on('application:status', handleStatusChange);

    return () => {
      socket.off('application:new', handleNewApplication);
      socket.off('application:status', handleStatusChange);
    };
  }, [socket]);

  return applicationUpdate;
}

export default SocketContext;
