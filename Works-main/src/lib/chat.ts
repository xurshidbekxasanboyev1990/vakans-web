import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

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

// Get Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ================================================
// CHAT SERVICE
// ================================================

export class ChatService {
  /**
   * Get or create conversation between two users
   */
  static async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    // Ensure consistent ordering for conversation_id
    const [participant1, participant2] = userId1 < userId2 
      ? [userId1, userId2] 
      : [userId2, userId1];

    // Check if conversation exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant1_id', participant1)
      .eq('participant2_id', participant2)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const conversationId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        participant1_id: participant1,
        participant2_id: participant2,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data.id;
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
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        message: message.trim(),
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, limit = 50): Promise<MessageWithUser[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data as MessageWithUser[];
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(conversationId: string, receiverId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', receiverId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get user's conversations list
   */
  static async getConversations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!conversations_participant1_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        participant2:users!conversations_participant2_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Subscribe to new messages in a conversation
   */
  static subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Subscribe to all conversations for a user
   */
  static subscribeToConversations(
    userId: string,
    onUpdate: () => void
  ) {
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = ChatService.subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage as any]);
      
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
        await ChatService.sendMessage(conversationId, currentUserId, receiverId, text);
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async () => {
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
