import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Bell,
  Mail,
  MessageSquare,
  Send,
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap,
  Play,
  Pause,
  Eye,
  Copy,
  TestTube
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push';
  trigger: string;
  subject?: string;
  template: string;
  variables: string[];
  isActive: boolean;
  sentCount: number;
}

interface NotificationLog {
  id: string;
  templateId: string;
  templateName: string;
  type: 'sms' | 'email' | 'push';
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt: string;
}

export function AutoNotifySystem() {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'settings'>('templates');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'sms' as 'sms' | 'email' | 'push',
    trigger: '',
    subject: '',
    template: '',
  });

  // Demo templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Yangi ariza keldi',
      type: 'sms',
      trigger: 'new_application',
      template: 'Vakans.uz: "{jobTitle}" ishi uchun yangi ariza keldi. {applicantName} dan. Tekshiring: vakans.uz/employer',
      variables: ['jobTitle', 'applicantName'],
      isActive: true,
      sentCount: 1234,
    },
    {
      id: '2',
      name: 'Ariza qabul qilindi',
      type: 'sms',
      trigger: 'application_accepted',
      template: 'Vakans.uz: Tabriklaymiz! "{jobTitle}" ishi uchun arizangiz qabul qilindi. Ish beruvchi siz bilan bog\'lanadi.',
      variables: ['jobTitle'],
      isActive: true,
      sentCount: 567,
    },
    {
      id: '3',
      name: 'Ariza rad etildi',
      type: 'sms',
      trigger: 'application_rejected',
      template: 'Vakans.uz: Afsuski, "{jobTitle}" ishi uchun arizangiz rad etildi. Boshqa ishlarni ko\'ring: vakans.uz',
      variables: ['jobTitle'],
      isActive: true,
      sentCount: 234,
    },
    {
      id: '4',
      name: 'Ish e\'loni tasdiqlandi',
      type: 'sms',
      trigger: 'job_approved',
      template: 'Vakans.uz: "{jobTitle}" ish e\'loningiz tasdiqlandi va saytda joylashtirildi!',
      variables: ['jobTitle'],
      isActive: true,
      sentCount: 890,
    },
    {
      id: '5',
      name: 'Xush kelibsiz',
      type: 'email',
      trigger: 'user_registered',
      subject: 'Vakans.uz ga xush kelibsiz!',
      template: `Hurmatli {userName},

Vakans.uz platformasiga xush kelibsiz!

Siz endi:
- Minglab ish e'lonlarini ko'rishingiz
- Bir necha bosish bilan ariza yuborishingiz
- Profilingizni to'ldirib, ish beruvchilarni jalb qilishingiz mumkin.

Omad tilaymiz!
Vakans.uz jamoasi`,
      variables: ['userName'],
      isActive: true,
      sentCount: 4567,
    },
    {
      id: '6',
      name: 'Yangi ishlar',
      type: 'push',
      trigger: 'matching_jobs',
      template: '🎯 Sizning ko\'nikmalaringizga mos {count} ta yangi ish topildi!',
      variables: ['count'],
      isActive: false,
      sentCount: 12340,
    },
  ]);

  // Demo logs
  const [logs] = useState<NotificationLog[]>([
    {
      id: '1',
      templateId: '1',
      templateName: 'Yangi ariza keldi',
      type: 'sms',
      recipient: '+998901234567',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '2',
      templateId: '2',
      templateName: 'Ariza qabul qilindi',
      type: 'sms',
      recipient: '+998912345678',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      templateId: '5',
      templateName: 'Xush kelibsiz',
      type: 'email',
      recipient: 'user@example.com',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '4',
      templateId: '3',
      templateName: 'Ariza rad etildi',
      type: 'sms',
      recipient: '+998933334455',
      status: 'failed',
      error: 'Invalid phone number',
      sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ]);

  // Settings
  const [settings, setSettings] = useState({
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    smsProvider: 'eskiz',
    emailProvider: 'smtp',
    dailyLimit: 1000,
    rateLimitPerMinute: 60,
    retryFailedEnabled: true,
    retryAttempts: 3,
  });

  const triggerOptions = [
    { value: 'new_application', label: 'Yangi ariza kelganda', icon: FileText },
    { value: 'application_accepted', label: 'Ariza qabul qilinganda', icon: CheckCircle },
    { value: 'application_rejected', label: 'Ariza rad etilganda', icon: AlertTriangle },
    { value: 'job_approved', label: 'Ish tasdiqlanganda', icon: Briefcase },
    { value: 'job_rejected', label: 'Ish rad etilganda', icon: AlertTriangle },
    { value: 'user_registered', label: 'Yangi user ro\'yxatdan o\'tganda', icon: Users },
    { value: 'matching_jobs', label: 'Mos ishlar topilganda', icon: Zap },
    { value: 'job_expiring', label: 'Ish muddati tugayotganda', icon: Clock },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Yuborildi</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Xatolik</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Kutilmoqda</Badge>;
      default:
        return null;
    }
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.template || !newTemplate.trigger) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    // Extract variables from template
    const variableMatches = newTemplate.template.match(/\{(\w+)\}/g) || [];
    const variables = variableMatches.map(v => v.replace(/[{}]/g, ''));

    const template: NotificationTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: newTemplate.name,
      type: newTemplate.type,
      trigger: newTemplate.trigger,
      subject: newTemplate.type === 'email' ? newTemplate.subject : undefined,
      template: newTemplate.template,
      variables,
      isActive: true,
      sentCount: editingTemplate?.sentCount || 0,
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? template : t));
      toast.success('Shablon yangilandi');
    } else {
      setTemplates(prev => [template, ...prev]);
      toast.success('Shablon yaratildi');
    }

    setShowTemplateDialog(false);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      type: 'sms',
      trigger: '',
      subject: '',
      template: '',
    });
  };

  const handleTestTemplate = (template: NotificationTemplate) => {
    toast.success(`Test xabar yuborildi: ${template.name}`);
  };

  const handleToggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Shablon o\'chirildi');
  };

  const tabs = [
    { id: 'templates', label: 'Shablonlar', icon: FileText },
    { id: 'logs', label: 'Yuborish tarixi', icon: Clock },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ] as const;

  const stats = {
    totalSent: templates.reduce((sum, t) => sum + t.sentCount, 0),
    activeTemplates: templates.filter(t => t.isActive).length,
    todaySent: 245,
    failedToday: 3,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Avtomatik bildirishnomalar</h1>
          <p className="text-sm text-muted-foreground">SMS, Email va Push notification avtomatlashtirish</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami yuborilgan</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalSent.toLocaleString()}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faol shablonlar</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.activeTemplates}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugun yuborilgan</p>
                <p className="text-2xl font-bold text-purple-500">{stats.todaySent}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Xatoliklar</p>
                <p className="text-2xl font-bold text-red-500">{stats.failedToday}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="bg-white/80 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800/50">
        <CardContent className="p-2">
          <div className="flex gap-1 flex-wrap">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : ''}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bildirishnoma shablonlari</CardTitle>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                    onClick={() => {
                      setEditingTemplate(null);
                      setNewTemplate({
                        name: '',
                        type: 'sms',
                        trigger: '',
                        subject: '',
                        template: '',
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Yangi shablon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingTemplate ? 'Shablonni tahrirlash' : 'Yangi shablon yaratish'}</DialogTitle>
                    <DialogDescription>
                      Avtomatik yuboriladigan xabar shablonini sozlang
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Shablon nomi</Label>
                      <Input
                        placeholder="Masalan: Yangi ariza keldi"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Xabar turi</Label>
                        <select
                          title="Xabar turi"
                          className="w-full p-2 rounded-md border bg-background"
                          value={newTemplate.type}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                        >
                          <option value="sms">SMS</option>
                          <option value="email">Email</option>
                          <option value="push">Push notification</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Trigger (qachon yuboriladi)</Label>
                        <select
                          title="Trigger"
                          className="w-full p-2 rounded-md border bg-background"
                          value={newTemplate.trigger}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, trigger: e.target.value }))}
                        >
                          <option value="">Tanlang...</option>
                          {triggerOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {newTemplate.type === 'email' && (
                      <div className="space-y-2">
                        <Label>Email mavzusi</Label>
                        <Input
                          placeholder="Email sarlavhasi"
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Xabar matni</Label>
                      <Textarea
                        placeholder={`O'zgaruvchilar: {userName}, {jobTitle}, {applicantName}...`}
                        value={newTemplate.template}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, template: e.target.value }))}
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        O'zgaruvchilar uchun {'{'}variableName{'}'} formatidan foydalaning
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                      Bekor qilish
                    </Button>
                    <Button onClick={handleSaveTemplate} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                      {editingTemplate ? 'Yangilash' : 'Yaratish'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border ${
                    template.isActive 
                      ? 'bg-cyan-500/5 border-cyan-500/20' 
                      : 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        template.type === 'sms' ? 'bg-emerald-500/20 text-emerald-500' :
                        template.type === 'email' ? 'bg-purple-500/20 text-purple-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {getTypeIcon(template.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {triggerOptions.find(t => t.value === template.trigger)?.label}
                          </Badge>
                          {template.isActive ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400">Faol</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">O'chirilgan</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2">
                          {template.template}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{template.sentCount.toLocaleString()} marta yuborilgan</span>
                          {template.variables.length > 0 && (
                            <span>O'zgaruvchilar: {template.variables.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleTestTemplate(template)}
                        title="Test yuborish"
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingTemplate(template);
                          setNewTemplate({
                            name: template.name,
                            type: template.type,
                            trigger: template.trigger,
                            subject: template.subject || '',
                            template: template.template,
                          });
                          setShowTemplateDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Switch 
                        checked={template.isActive} 
                        onCheckedChange={() => handleToggleTemplate(template.id)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>Yuborish tarixi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        log.status === 'sent' ? 'bg-emerald-500/20 text-emerald-500' :
                        log.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {getTypeIcon(log.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.templateName}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qabul qiluvchi: {log.recipient}
                        </p>
                        {log.error && (
                          <p className="text-sm text-red-400 mt-1">Xatolik: {log.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.sentAt).toLocaleString('uz-UZ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Umumiy sozlamalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-medium">SMS bildirishnomalar</p>
                    <p className="text-sm text-muted-foreground">Eskiz.uz orqali SMS yuborish</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.smsEnabled} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Email bildirishnomalar</p>
                    <p className="text-sm text-muted-foreground">SMTP orqali email yuborish</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.emailEnabled} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Push bildirishnomalar</p>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pushEnabled} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kunlik limit</Label>
                  <Input 
                    type="number" 
                    value={settings.dailyLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">Kuniga maksimal xabar soni</p>
                </div>
                <div className="space-y-2">
                  <Label>Daqiqalik limit</Label>
                  <Input 
                    type="number" 
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => setSettings(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">Daqiqada maksimal xabar</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div>
                  <p className="font-medium">Muvaffaqiyatsiz xabarlarni qayta yuborish</p>
                  <p className="text-sm text-muted-foreground">{settings.retryAttempts} marta urinish</p>
                </div>
                <Switch 
                  checked={settings.retryFailedEnabled} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, retryFailedEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
