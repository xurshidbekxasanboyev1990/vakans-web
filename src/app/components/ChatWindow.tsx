import { useState, useEffect, useRef } from 'react';
import { X, Send, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName: string; // Kim yuborgan
  timestamp: string;
}

interface ChatWindowProps {
  jobId: string;
  employerName: string;
  employerPhone: string;
  currentUserName: string;
  currentUserType: 'worker' | 'employer'; // Ishchi yoki ish beruvchi
  onClose: () => void;
}

export function ChatWindow({ jobId, employerName, employerPhone, currentUserName, currentUserType, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage'dan chatni yuklash - UMUMIY KALIT
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      const allChats = JSON.parse(savedChats);
      // Umumiy chat kaliti: faqat jobId
      const chatKey = `job-${jobId}`;
      if (allChats[chatKey]) {
        setMessages(allChats[chatKey]);
      }
    }
  }, [jobId]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (updatedMessages: Message[]) => {
    const savedChats = localStorage.getItem('chats');
    const allChats = savedChats ? JSON.parse(savedChats) : {};
    // Umumiy chat kaliti: faqat jobId
    const chatKey = `job-${jobId}`;
    allChats[chatKey] = updatedMessages;
    localStorage.setItem('chats', JSON.stringify(allChats));
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      senderName: currentUserName,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full sm:max-w-lg h-full sm:h-[600px] sm:max-h-[90vh] flex flex-col bg-card sm:rounded-2xl rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 sm:rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{employerName}</h3>
            <a 
              href={`tel:${employerPhone}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {employerPhone}
            </a>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-10 h-10 p-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                Xabar yo'q<br/>
                Birinchi xabaringizni yozing
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                // Kim yuborgan xabarni aniqlaymiz
                const isMyMessage = message.senderName === currentUserName;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        isMyMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {/* Kimdan kelgani */}
                      {!isMyMessage && (
                        <p className="text-xs font-semibold mb-1 text-muted-foreground">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm break-words">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Xabar yozing..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="sm" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
