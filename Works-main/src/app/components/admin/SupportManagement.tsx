import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Send, 
  User, 
  Phone, 
  Settings,
  Save,
  Trash2,
  AlertCircle,
  Key,
  Lock
} from 'lucide-react';

interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userType?: 'worker' | 'employer';
  message: string;
  createdAt: string;
  status: 'pending' | 'answered' | 'new' | 'resolved';
  reply: string | null;
  repliedAt?: string;
  requestType?: 'general' | 'password_reset';
  newPassword?: string | null;
}

interface SupportInfo {
  telegram: string;
  phone: string;
  workHours?: string;
}

export function SupportManagement() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [supportInfo, setSupportInfo] = useState<SupportInfo>({
    telegram: '@vakans_support',
    phone: '+998 90 123 45 67',
    workHours: '9:00 - 18:00 (Dush-Jum)'
  });
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});
  const [newPasswordText, setNewPasswordText] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState<'messages' | 'settings'>('messages');

  useEffect(() => {
    // Load messages
    const stored = localStorage.getItem('supportMessages');
    if (stored) {
      setMessages(JSON.parse(stored));
    }

    // Load support info
    const storedInfo = localStorage.getItem('supportInfo');
    if (storedInfo) {
      setSupportInfo(JSON.parse(storedInfo));
    }
  }, []);

  const handleReply = (messageId: string) => {
    const reply = replyText[messageId];
    if (!reply?.trim()) return;

    const message = messages.find(m => m.id === messageId);
    const isPasswordReset = message?.requestType === 'password_reset';
    const newPassword = isPasswordReset ? newPasswordText[messageId] : null;

    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            reply, 
            status: 'resolved' as const, 
            repliedAt: new Date().toISOString(),
            newPassword: newPassword || null
          }
        : msg
    );

    setMessages(updatedMessages);
    localStorage.setItem('supportMessages', JSON.stringify(updatedMessages));
    setReplyText(prev => ({ ...prev, [messageId]: '' }));
    setNewPasswordText(prev => ({ ...prev, [messageId]: '' }));
  };

  const handleDelete = (messageId: string) => {
    if (!confirm('Xabarni o\'chirmoqchimisiz?')) return;
    
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    localStorage.setItem('supportMessages', JSON.stringify(updatedMessages));
  };

  const handleSaveSupportInfo = () => {
    localStorage.setItem('supportInfo', JSON.stringify(supportInfo));
    alert('Kontakt ma\'lumotlari saqlandi!');
  };

  const pendingCount = messages.filter(m => m.status === 'pending' || m.status === 'new').length;
  const answeredCount = messages.filter(m => m.status === 'answered' || m.status === 'resolved').length;
  const passwordResetCount = messages.filter(m => m.requestType === 'password_reset' && (m.status === 'pending' || m.status === 'new')).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Qo'llab-quvvatlash</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Foydalanuvchi xabarlari va kontaktlar</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kutilmoqda</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 border-purple-200 dark:border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parol tiklash</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">{passwordResetCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Javob berilgan</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{answeredCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jami xabarlar</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{messages.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'messages' ? 'default' : 'outline'}
          onClick={() => setActiveTab('messages')}
          className={activeTab === 'messages' ? 'bg-pink-500 hover:bg-pink-600' : ''}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Xabarlar
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-amber-500">{pendingCount}</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
          className={activeTab === 'settings' ? 'bg-pink-500 hover:bg-pink-600' : ''}
        >
          <Settings className="w-4 h-4 mr-2" />
          Kontakt sozlamalari
        </Button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Hozircha xabarlar yo'q</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.sort((a, b) => {
              // Pending/new first, then by date
              if ((a.status === 'pending' || a.status === 'new') && b.status === 'answered') return -1;
              if (a.status === 'answered' && (b.status === 'pending' || b.status === 'new')) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }).map((message) => (
              <Card key={message.id} className={`bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 ${(message.status === 'pending' || message.status === 'new') ? 'ring-1 ring-amber-500/50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.userType === 'employer' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{message.userName}</p>
                          {message.userType && (
                            <Badge variant="outline" className={message.userType === 'employer' ? 'text-purple-600 border-purple-300' : 'text-blue-600 border-blue-300'}>
                              {message.userType === 'employer' ? 'Ish beruvchi' : 'Ishchi'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone className="w-3 h-3" />
                          <span>{message.userPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={(message.status === 'pending' || message.status === 'new') ? 'bg-amber-500' : 'bg-emerald-500'}>
                        {(message.status === 'pending' || message.status === 'new') ? 'Yangi' : 'Javob berildi'}
                      </Badge>
                      {message.requestType === 'password_reset' && (
                        <Badge className="bg-purple-500">
                          <Key className="w-3 h-3 mr-1" />
                          Parol tiklash
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(message.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* User Message */}
                  <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(message.createdAt)}</p>
                  </div>

                  {/* Reply */}
                  {message.reply ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Javob</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{message.reply}</p>
                      {message.newPassword && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-300 dark:border-emerald-600">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm mb-1">
                            <Key className="w-4 h-4" />
                            <span>Yangi parol:</span>
                          </div>
                          <p className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{message.newPassword}</p>
                        </div>
                      )}
                      {message.repliedAt && (
                        <p className="text-xs text-gray-500 mt-2">{formatDate(message.repliedAt)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Parol tiklash so'rovi uchun yangi parol kiritish */}
                      {message.requestType === 'password_reset' && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mb-2">
                            <Lock className="w-4 h-4" />
                            <span className="font-medium">Parol tiklash so'rovi</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Yangi parolni kiriting"
                              value={newPasswordText[message.id] || ''}
                              onChange={(e) => setNewPasswordText(prev => ({ ...prev, [message.id]: e.target.value }))}
                              className="flex-1 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-600"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const randomPassword = Math.random().toString(36).slice(-8).toUpperCase();
                                setNewPasswordText(prev => ({ ...prev, [message.id]: randomPassword }));
                              }}
                              className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            >
                              Generatsiya
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={message.requestType === 'password_reset' ? "Javob yozing (masalan: Yangi parolingiz o'rnatildi)..." : "Javob yozing..."}
                          value={replyText[message.id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [message.id]: e.target.value }))}
                          className="flex-1 bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 min-h-[80px]"
                        />
                        <Button
                          onClick={() => handleReply(message.id)}
                          disabled={!replyText[message.id]?.trim()}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Kontakt ma'lumotlari</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bu ma'lumotlar foydalanuvchilarga Sidebar da ko'rsatiladi
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Telegram username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.46-1.901-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.169.331.015.097.034.318.019.49z"/>
                  </svg>
                </div>
                <Input
                  value={supportInfo.telegram}
                  onChange={(e) => setSupportInfo(prev => ({ ...prev, telegram: e.target.value }))}
                  className="pl-14 bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Telefon raqam</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <Input
                  value={supportInfo.phone}
                  onChange={(e) => setSupportInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-14 bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                  placeholder="+998 XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Ish vaqti</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <Input
                  value={supportInfo.workHours || '9:00 - 18:00 (Dush-Jum)'}
                  onChange={(e) => setSupportInfo(prev => ({ ...prev, workHours: e.target.value }))}
                  className="pl-14 bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                  placeholder="9:00 - 18:00 (Dush-Jum)"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveSupportInfo} className="bg-pink-500 hover:bg-pink-600">
                <Save className="w-4 h-4 mr-2" />
                Saqlash
              </Button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Eslatma</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Bu kontakt ma'lumotlari foydalanuvchilarning Sidebar bo'limidagi "Yordam" qismida ko'rsatiladi.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
