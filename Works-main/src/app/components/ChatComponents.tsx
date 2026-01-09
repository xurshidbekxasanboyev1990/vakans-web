import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat, useConversations, useStartConversation, MessageWithUser } from '../../lib/chat';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Send, MessageCircle, X } from 'lucide-react';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  onClose?: () => void;
}

/**
 * Chat Window Component - Real-time messaging
 * Works for both worker and employer roles
 */
export function ChatWindow({ recipientId, recipientName, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const { startConversation } = useStartConversation();
  const { messages, loading, error, sendMessage } = useChat(conversationId, user?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (user?.id && recipientId) {
      startConversation(user.id, recipientId).then(setConversationId);
    }
  }, [user?.id, recipientId, startConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      await sendMessage(recipientId, messageText);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat with {recipientName}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Area */}
        <ScrollArea className="h-[400px] pr-4">
          {loading && messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Loading messages...
            </div>
          )}
          
          {error && (
            <div className="text-center text-red-500 py-4">
              Error: {error}
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message: MessageWithUser) => {
              const isOwn = message.sender_id === user.id;
              const senderName = isOwn 
                ? 'You' 
                : `${message.sender.first_name} ${message.sender.last_name}`;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatar_url} />
                    <AvatarFallback>
                      {message.sender.first_name[0]}
                      {message.sender.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className="text-xs text-muted-foreground mb-1">
                      {senderName}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(message.created_at).toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Xabar yozing..."
            className="flex-1"
            disabled={!conversationId || loading}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || !conversationId || loading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Conversations List Component
 * Shows all active conversations
 */
export function ConversationsList() {
  const { user } = useAuth();
  const { conversations, loading, unreadCount } = useConversations(user?.id || '');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  if (!user) return null;

  if (selectedConversation) {
    const otherParticipant = selectedConversation.participant1_id === user.id
      ? selectedConversation.participant2
      : selectedConversation.participant1;

    return (
      <ChatWindow
        recipientId={otherParticipant.id}
        recipientName={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
        onClose={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </span>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center text-muted-foreground py-8">
            Loading conversations...
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No conversations yet
          </div>
        )}

        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const otherParticipant = conv.participant1_id === user.id
              ? conv.participant2
              : conv.participant1;

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full p-4 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={otherParticipant.avatar_url} />
                    <AvatarFallback>
                      {otherParticipant.first_name[0]}
                      {otherParticipant.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">
                      {otherParticipant.first_name} {otherParticipant.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {conv.last_message || 'No messages yet'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conv.last_message_at).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mini Chat Button - Can be placed anywhere
 * Useful for job cards, profiles, etc.
 */
interface ChatButtonProps {
  recipientId: string;
  recipientName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ChatButton({ recipientId, recipientName, variant = 'default', size = 'default' }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div onClick={() => setShowChat(false)} className="absolute inset-0" />
        <div className="relative z-10 w-full max-w-2xl">
          <ChatWindow
            recipientId={recipientId}
            recipientName={recipientName}
            onClose={() => setShowChat(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setShowChat(true)}
      className="gap-2"
    >
      <MessageCircle className="w-4 h-4" />
      Send Message
    </Button>
  );
}
