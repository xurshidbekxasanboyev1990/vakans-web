import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

interface TypingUser {
  odemonger: string;
  userName: string;
}

/**
 * Real-time chat hook
 */
export function useRealTimeChat(chatId: string) {
  const { socket, isConnected, joinChat, leaveChat, sendMessage, setTyping } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Join chat room on mount
  useEffect(() => {
    if (!isConnected || !chatId) return;
    
    joinChat(chatId);
    console.log('💬 Joined chat:', chatId);

    return () => {
      leaveChat(chatId);
      console.log('💬 Left chat:', chatId);
    };
  }, [isConnected, chatId, joinChat, leaveChat]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.chatId === chatId) {
        console.log('💬 New message:', message);
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTyping = (data: { chatId: string; odemonger: string; userName: string; isTyping: boolean }) => {
      if (data.chatId !== chatId) return;
      
      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add to typing users if not already there
          if (!prev.find(u => u.odemonger === data.odemonger)) {
            return [...prev, { odemonger: data.odemonger, userName: data.userName }];
          }
        } else {
          // Remove from typing users
          return prev.filter(u => u.odemonger !== data.odemonger);
        }
        return prev;
      });
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, isConnected, chatId]);

  // Send message handler
  const send = useCallback((message: string, receiverId: string) => {
    if (!chatId || !message.trim()) return;
    sendMessage(chatId, message.trim(), receiverId);
  }, [chatId, sendMessage]);

  // Typing indicator handler with debounce
  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      setTyping(chatId, true);
    }
  }, [chatId, isTyping, setTyping]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      setTyping(chatId, false);
    }
  }, [chatId, isTyping, setTyping]);

  // Clear messages (for changing chats)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setTypingUsers([]);
  }, []);

  return {
    messages,
    setMessages,
    typingUsers,
    isConnected,
    send,
    startTyping,
    stopTyping,
    clearMessages
  };
}
