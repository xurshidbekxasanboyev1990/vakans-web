import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Settings, Bell, MessageSquare, Palette, Globe, Save, RefreshCw, AlertTriangle, Lock, Eye, EyeOff, Shield, KeyRound, DollarSign, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  jobPostingEnabled: boolean;
  maxJobsPerEmployer: number;
  applicationDeadlineDays: number;
  // Pullik rejim
  paidModeEnabled: boolean;
  jobPostPrice: number;
  featuredJobPrice: number;
  urgentJobPrice: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newUserNotification: boolean;
  newJobNotification: boolean;
  newApplicationNotification: boolean;
}

interface SmsTemplate {
  id: string;
  name: string;
  template: string;
  description: string;
}

interface SystemSettingsProps {
  onSave?: (settings: SiteSettings) => void;
}

export function SystemSettings({ onSave }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<'site' | 'payment' | 'notifications' | 'sms' | 'theme' | 'security'>('site');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Admin credentials state
  const [adminCredentials, setAdminCredentials] = useState({
    currentPassword: '',
    newPhone: '+998996983806',
    newPassword: '',
    confirmPassword: '',
    newPin: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    pin: false,
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Works.uz',
    siteDescription: "O'zbekistonning eng yaxshi ish qidirish platformasi",
    contactEmail: 'info@works.uz',
    contactPhone: '+998 71 123 45 67',
    maintenanceMode: false,
    registrationEnabled: true,
    jobPostingEnabled: true,
    maxJobsPerEmployer: 10,
    applicationDeadlineDays: 30,
    // Pullik rejim - boshlang'ichda o'chirilgan (tekin)
    paidModeEnabled: false,
    jobPostPrice: 50000,
    featuredJobPrice: 100000,
    urgentJobPrice: 75000,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    newUserNotification: true,
    newJobNotification: true,
    newApplicationNotification: true,
  });

  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([
    { id: '1', name: 'Tasdiqlash kodi', template: 'Works.uz: Sizning tasdiqlash kodingiz: {code}. 5 daqiqa ichida kiriting.', description: "Ro'yxatdan o'tishda SMS" },
    { id: '2', name: 'Yangi ariza', template: 'Works.uz: "{job}" ishi uchun yangi ariza keldi. Tekshiring: works.uz/employer', description: 'Ish beruvchiga bildirishnoma' },
    { id: '3', name: 'Ariza qabul', template: 'Works.uz: Tabriklaymiz! "{job}" ishi uchun arizangiz qabul qilindi.', description: 'Ishchiga xabar' },
    { id: '4', name: 'Ariza rad', template: 'Works.uz: Afsuski, "{job}" ishi uchun arizangiz rad etildi. Boshqa ishlarni ko\'ring.', description: 'Rad etilganda' },
  ]);

  const [theme, setTheme] = useState({
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    darkMode: false,
  });

  const updateSiteSettings = (key: keyof SiteSettings, value: string | number | boolean) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNotifications = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateSmsTemplate = (id: string, template: string) => {
    setSmsTemplates(prev => prev.map(t => t.id === id ? { ...t, template } : t));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(siteSettings);
    }
    setHasChanges(false);
    setSaveModalOpen(true);
  };

  const tabs = [
    { id: 'site', label: 'Sayt sozlamalari', icon: Globe },
    { id: 'payment', label: "To'lov sozlamalari", icon: CreditCard },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'sms', label: 'SMS shablonlar', icon: MessageSquare },
    { id: 'theme', label: 'Tema', icon: Palette },
    { id: 'security', label: 'Xavfsizlik', icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tizim sozlamalari</h1>
        <p className="text-sm text-muted-foreground mt-1">Sayt va tizim sozlamalarini boshqarish</p>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Settings Tab */}
      {activeTab === 'site' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Sayt sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sayt nomi</Label>
                <Input value={siteSettings.siteName} onChange={(e) => updateSiteSettings('siteName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kontakt email</Label>
                <Input type="email" value={siteSettings.contactEmail} onChange={(e) => updateSiteSettings('contactEmail', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kontakt telefon</Label>
                <Input value={siteSettings.contactPhone} onChange={(e) => updateSiteSettings('contactPhone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ish beruvchi uchun max ishlar</Label>
                <Input type="number" value={siteSettings.maxJobsPerEmployer} onChange={(e) => updateSiteSettings('maxJobsPerEmployer', parseInt(e.target.value))} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sayt tavsifi</Label>
              <Textarea value={siteSettings.siteDescription} onChange={(e) => updateSiteSettings('siteDescription', e.target.value)} rows={3} />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Tizim holati</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Texnik ishlar rejimi</Label>
                    <p className="text-sm text-muted-foreground">Saytni vaqtincha yoping</p>
                  </div>
                  <Switch checked={siteSettings.maintenanceMode} onCheckedChange={(v) => updateSiteSettings('maintenanceMode', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ro'yxatdan o'tish</Label>
                    <p className="text-sm text-muted-foreground">Yangi foydalanuvchilar ro'yxatdan o'ta oladi</p>
                  </div>
                  <Switch checked={siteSettings.registrationEnabled} onCheckedChange={(v) => updateSiteSettings('registrationEnabled', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ish e'lonlari</Label>
                    <p className="text-sm text-muted-foreground">Yangi ish e'lonlari joylash mumkin</p>
                  </div>
                  <Switch checked={siteSettings.jobPostingEnabled} onCheckedChange={(v) => updateSiteSettings('jobPostingEnabled', v)} />
                </div>
              </div>
            </div>

            {siteSettings.maintenanceMode && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Texnik ishlar rejimi yoqilgan. Foydalanuvchilar saytga kira olmaydi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Settings Tab */}
      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              To'lov sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pullik rejim toggle */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Pullik rejim</Label>
                    <p className="text-sm text-muted-foreground">
                      {siteSettings.paidModeEnabled 
                        ? "Yoqilgan - E'lon joylash pullik" 
                        : "O'chirilgan - E'lon joylash tekin"}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={siteSettings.paidModeEnabled} 
                  onCheckedChange={(v) => {
                    updateSiteSettings('paidModeEnabled', v);
                    toast.success(v ? "Pullik rejim yoqildi" : "Tekin rejim yoqildi");
                  }} 
                />
              </div>
            </div>

            {siteSettings.paidModeEnabled && (
              <>
                {/* Narxlar */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Narxlar (so'm)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                      <Label className="text-blue-700 dark:text-blue-400">Oddiy e'lon</Label>
                      <Input 
                        type="number" 
                        value={siteSettings.jobPostPrice} 
                        onChange={(e) => updateSiteSettings('jobPostPrice', parseInt(e.target.value) || 0)} 
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Asosiy e'lon narxi</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                      <Label className="text-purple-700 dark:text-purple-400">Featured e'lon</Label>
                      <Input 
                        type="number" 
                        value={siteSettings.featuredJobPrice} 
                        onChange={(e) => updateSiteSettings('featuredJobPrice', parseInt(e.target.value) || 0)} 
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Yuqorida ko'rsatiladi</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                      <Label className="text-red-700 dark:text-red-400">Shoshilinch e'lon</Label>
                      <Input 
                        type="number" 
                        value={siteSettings.urgentJobPrice} 
                        onChange={(e) => updateSiteSettings('urgentJobPrice', parseInt(e.target.value) || 0)} 
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">"Shoshilinch" belgisi</p>
                    </div>
                  </div>
                </div>

                {/* To'lov haqida ma'lumot */}
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">To'lov jarayoni</h4>
                  <ol className="text-sm text-green-600 dark:text-green-500 space-y-1 list-decimal list-inside">
                    <li>Ish beruvchi e'lon joylaydi</li>
                    <li>E'lon "Ko'rib chiqilmoqda" holatiga o'tadi</li>
                    <li>Admin to'lovni qo'lda tekshiradi</li>
                    <li>To'lov qilingan bo'lsa - tasdiqlaydi</li>
                    <li>E'lon faollashadi</li>
                  </ol>
                </div>
              </>
            )}

            {!siteSettings.paidModeEnabled && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Badge className="bg-emerald-500">TEKIN</Badge>
                  <span className="font-medium">Hozirda barcha e'lonlar tekin</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                  Pullik rejimni yoqish uchun yuqoridagi tugmani bosing
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirishnoma sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Bildirishnoma kanallari</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email bildirishnomalar</Label>
                    <p className="text-sm text-muted-foreground">Emailga xabarlar yuborish</p>
                  </div>
                  <Switch checked={notificationSettings.emailNotifications} onCheckedChange={(v) => updateNotifications('emailNotifications', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS bildirishnomalar</Label>
                    <p className="text-sm text-muted-foreground">SMS xabarlar yuborish</p>
                  </div>
                  <Switch checked={notificationSettings.smsNotifications} onCheckedChange={(v) => updateNotifications('smsNotifications', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push bildirishnomalar</Label>
                    <p className="text-sm text-muted-foreground">Brauzerga push xabarlar</p>
                  </div>
                  <Switch checked={notificationSettings.pushNotifications} onCheckedChange={(v) => updateNotifications('pushNotifications', v)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Adminga xabarlar</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Yangi foydalanuvchi</Label>
                    <p className="text-sm text-muted-foreground">Yangi ro'yxatdan o'tganda xabar</p>
                  </div>
                  <Switch checked={notificationSettings.newUserNotification} onCheckedChange={(v) => updateNotifications('newUserNotification', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Yangi ish e'loni</Label>
                    <p className="text-sm text-muted-foreground">Yangi ish joylanganda xabar</p>
                  </div>
                  <Switch checked={notificationSettings.newJobNotification} onCheckedChange={(v) => updateNotifications('newJobNotification', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Yangi ariza</Label>
                    <p className="text-sm text-muted-foreground">Yangi ariza kelganda xabar</p>
                  </div>
                  <Switch checked={notificationSettings.newApplicationNotification} onCheckedChange={(v) => updateNotifications('newApplicationNotification', v)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMS Templates Tab */}
      {activeTab === 'sms' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              SMS shablonlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Mavjud o'zgaruvchilar: {'{code}'}, {'{job}'}, {'{user}'}, {'{date}'}
            </p>
            
            {smsTemplates.map(template => (
              <div key={template.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">{template.name}</Label>
                  <Badge variant="outline">{template.description}</Badge>
                </div>
                <Textarea
                  value={template.template}
                  onChange={(e) => updateSmsTemplate(template.id, e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Tema sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asosiy rang</Label>
                <div className="flex gap-2">
                  <Input type="color" value={theme.primaryColor} onChange={(e) => { setTheme({...theme, primaryColor: e.target.value}); setHasChanges(true); }} className="w-16 h-10 p-1" />
                  <Input value={theme.primaryColor} onChange={(e) => { setTheme({...theme, primaryColor: e.target.value}); setHasChanges(true); }} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Qo'shimcha rang</Label>
                <div className="flex gap-2">
                  <Input type="color" value={theme.accentColor} onChange={(e) => { setTheme({...theme, accentColor: e.target.value}); setHasChanges(true); }} className="w-16 h-10 p-1" />
                  <Input value={theme.accentColor} onChange={(e) => { setTheme({...theme, accentColor: e.target.value}); setHasChanges(true); }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Qorong'u rejim</Label>
                <p className="text-sm text-muted-foreground">Standart qorong'u tema</p>
              </div>
              <Switch checked={theme.darkMode} onCheckedChange={(v) => { setTheme({...theme, darkMode: v}); setHasChanges(true); }} />
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Ko'rinish</h4>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: theme.primaryColor }}></div>
                <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: theme.accentColor }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab - Admin Password Change */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Admin xavfsizlik sozlamalari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Credentials Display */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Joriy admin ma'lumotlari
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Telefon:</span>
                  <span className="ml-2 font-mono bg-black/20 px-2 py-1 rounded">+998996983806</span>
                </div>
                <div>
                  <span className="text-gray-500">PIN kod:</span>
                  <span className="ml-2 font-mono bg-black/20 px-2 py-1 rounded">2024</span>
                </div>
              </div>
            </div>

            {/* Change Phone Number */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Telefon raqamni o'zgartirish
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPhone">Yangi telefon raqam</Label>
                  <Input
                    id="newPhone"
                    type="tel"
                    value={adminCredentials.newPhone}
                    onChange={(e) => {
                      setAdminCredentials(prev => ({ ...prev, newPhone: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="+998 XX XXX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Parolni o'zgartirish
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Joriy parol</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={adminCredentials.currentPassword}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Joriy parolni kiriting"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yangi parol</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={adminCredentials.newPassword}
                      onChange={(e) => {
                        setAdminCredentials(prev => ({ ...prev, newPassword: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="Yangi parolni kiriting"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yangi parolni tasdiqlang</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={adminCredentials.confirmPassword}
                      onChange={(e) => {
                        setAdminCredentials(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="Parolni qayta kiriting"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {adminCredentials.newPassword && adminCredentials.confirmPassword && 
                adminCredentials.newPassword !== adminCredentials.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Parollar mos kelmaydi
                </p>
              )}
            </div>

            {/* Change PIN */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                PIN kodni o'zgartirish
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPin">Yangi PIN kod (4 raqam)</Label>
                  <div className="relative">
                    <Input
                      id="newPin"
                      type={showPasswords.pin ? 'text' : 'password'}
                      value={adminCredentials.newPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setAdminCredentials(prev => ({ ...prev, newPin: val }));
                        setHasChanges(true);
                      }}
                      placeholder="****"
                      maxLength={4}
                      className="pr-10 text-center text-xl tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, pin: !prev.pin }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.pin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Credentials Button */}
            <div className="pt-4">
              <Button 
                onClick={() => {
                  // Validate
                  if (!adminCredentials.currentPassword) {
                    toast.error('Joriy parolni kiriting');
                    return;
                  }
                  if (adminCredentials.currentPassword !== 'XOJISAID.13.13') {
                    toast.error('Joriy parol noto\'g\'ri');
                    return;
                  }
                  if (adminCredentials.newPassword && adminCredentials.newPassword !== adminCredentials.confirmPassword) {
                    toast.error('Yangi parollar mos kelmaydi');
                    return;
                  }
                  if (adminCredentials.newPin && adminCredentials.newPin.length !== 4) {
                    toast.error('PIN kod 4 ta raqamdan iborat bo\'lishi kerak');
                    return;
                  }
                  
                  // Save to localStorage for demo (in production, save to backend)
                  const savedCredentials = {
                    phone: adminCredentials.newPhone,
                    password: adminCredentials.newPassword || 'XOJISAID.13.13',
                    pin: adminCredentials.newPin || '2024',
                  };
                  localStorage.setItem('admin_credentials', JSON.stringify(savedCredentials));
                  
                  toast.success('Admin ma\'lumotlari yangilandi!');
                  setAdminCredentials(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    newPin: '',
                  }));
                  setHasChanges(false);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={!adminCredentials.currentPassword}
              >
                <Save className="w-4 h-4 mr-2" />
                Admin ma'lumotlarini saqlash
              </Button>
            </div>

            {/* Security Tips */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Xavfsizlik maslahatlari
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Parolni kamida 8 ta belgidan iborat qiling</li>
                <li>Katta va kichik harflar, raqamlar ishlating</li>
                <li>PIN kodni oson taxmin qilinadigan qilmang (1234, 0000)</li>
                <li>Parolni muntazam yangilab turing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        {hasChanges && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Bekor qilish
          </Button>
        )}
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-2" />
          Saqlash
        </Button>
      </div>

      {/* Save Confirmation Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Saqlandi!</DialogTitle>
            <DialogDescription>Sozlamalar muvaffaqiyatli saqlandi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSaveModalOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
