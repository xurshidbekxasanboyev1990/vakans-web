/**
 * Chat Service - Backend API orqali ishlaydi
 * PostgreSQL + Redis (Docker) bilan
 */
import { useEffect, useState, useCallback } from 'react';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
}

export interface MessageWithUser extends Message {
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Cookie-based auth
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API error');
  }

  return response.json();
}

// ================================================
// CHAT SERVICE - Backend API
// ================================================

export class ChatService {
  /**
   * Get or create conversation between two users
   */
  static async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    const result = await apiCall<{ conversationId: string }>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId1, userId2 }),
    });
    return result.conversationId;
  }

  /**
   * Send a message
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<Message> {
    const result = await apiCall<{ message: Message }>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        senderId,
        receiverId,
        message: message.trim(),
      }),
    });
    return result.message;
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, limit = 50): Promise<MessageWithUser[]> {
    const result = await apiCall<{ messages: MessageWithUser[] }>(
      `/chat/messages/${conversationId}?limit=${limit}`
    );
    return result.messages;
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(conversationId: string, receiverId: string): Promise<void> {
    await apiCall('/chat/messages/read', {
      method: 'PUT',
      body: JSON.stringify({ conversationId, receiverId }),
    });
  }

  /**
   * Get user's conversations list
   */
  static async getConversations(userId: string): Promise<Conversation[]> {
    const result = await apiCall<{ conversations: Conversation[] }>(
      `/chat/conversations/${userId}`
    );
    return result.conversations;
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const result = await apiCall<{ count: number }>(`/chat/unread/${userId}`);
    return result.count;
  }

  /**
   * Subscribe to new messages (polling-based for simplicity)
   * For real WebSocket, use Socket.io on backend
   */
  static subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ): () => void {
    let lastMessageId: string | null = null;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;

      try {
        const messages = await ChatService.getMessages(conversationId, 10);
        if (messages.length > 0) {
          const latestMessage = messages[messages.length - 1];
          if (lastMessageId && latestMessage.id !== lastMessageId) {
            onMessage(latestMessage);
          }
          lastMessageId = latestMessage.id;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }

      if (isActive) {
        setTimeout(poll, 3000); // Poll every 3 seconds
      }
    };

    poll();

    return () => {
      isActive = false;
    };
  }

  /**
   * Subscribe to all conversations for a user
   */
  static subscribeToConversations(
    userId: string,
    onUpdate: () => void
  ): () => void {
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;

      try {
        await ChatService.getConversations(userId);
        onUpdate();
      } catch (err) {
        console.error('Poll error:', err);
      }

      if (isActive) {
        setTimeout(poll, 5000); // Poll every 5 seconds
      }
    };

    // Initial delay
    setTimeout(poll, 5000);

    return () => {
      isActive = false;
    };
  }
}

// ================================================
// REACT HOOKS
// ================================================

/**
 * Hook to manage a single conversation
 */
export function useChat(conversationId: string | null, currentUserId: string) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    ChatService.getMessages(conversationId)
      .then((data) => {
        setMessages(data);
        setError(null);
        // Mark as read
        ChatService.markAsRead(conversationId, currentUserId);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conversationId, currentUserId]);

  // Subscribe to real-time updates (polling)
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = ChatService.subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage as MessageWithUser]);

      // Mark as read if it's for current user
      if (newMessage.receiver_id === currentUserId) {
        ChatService.markAsRead(conversationId, currentUserId);
      }
    });

    return unsubscribe;
  }, [conversationId, currentUserId]);

  // Send message
  const sendMessage = useCallback(
    async (receiverId: string, text: string) => {
      if (!conversationId || !text.trim()) return;

      try {
        const newMessage = await ChatService.sendMessage(
          conversationId,
          currentUserId,
          receiverId,
          text
        );
        setMessages((prev) => [...prev, newMessage as MessageWithUser]);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [conversationId, currentUserId]
  );

  return { messages, loading, error, sendMessage };
}

/**
 * Hook to manage conversations list
 */
export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await ChatService.getConversations(userId);
      setConversations(data);

      const count = await ChatService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = ChatService.subscribeToConversations(userId, () => {
      loadConversations();
    });

    return unsubscribe;
  }, [userId, loadConversations]);

  return { conversations, loading, unreadCount, reload: loadConversations };
}

/**
 * Hook to start a new conversation
 */
export function useStartConversation() {
  const [loading, setLoading] = useState(false);

  const startConversation = useCallback(
    async (userId1: string, userId2: string): Promise<string> => {
      setLoading(true);
      try {
        const conversationId = await ChatService.getOrCreateConversation(userId1, userId2);
        return conversationId;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { startConversation, loading };
}
