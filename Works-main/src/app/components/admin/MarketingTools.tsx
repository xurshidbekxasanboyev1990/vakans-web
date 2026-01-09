import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Megaphone, 
  Bell, 
  Mail, 
  MessageSquare, 
  Send,
  Users,
  Briefcase,
  Gift,
  Target,
  BarChart3,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
  Image,
  Smartphone,
  Globe,
  Sparkles,
  TrendingUp,
  Percent,
  Tag,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  targetAudience: 'all' | 'workers' | 'employers' | 'inactive';
  message: string;
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

interface PromoCode {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: 'homepage' | 'search' | 'popup';
  isActive: boolean;
  clicks: number;
  impressions: number;
  startDate: string;
  endDate: string;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalBonusPaid: number;
}

export function MarketingTools() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'banners' | 'promo' | 'referral' | 'analytics'>('campaigns');
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [showNewPromoDialog, setShowNewPromoDialog] = useState(false);
  const [showNewBannerDialog, setShowNewBannerDialog] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'push' as 'push' | 'email' | 'sms',
    targetAudience: 'all' as 'all' | 'workers' | 'employers' | 'inactive',
    title: '',
    message: '',
    scheduleType: 'now' as 'now' | 'scheduled',
    scheduledAt: '',
  });

  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    usageLimit: 100,
    validFrom: '',
    validTo: '',
  });

  // Demo data
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Yangi yil aksiyasi',
      type: 'push',
      status: 'sent',
      targetAudience: 'all',
      message: '🎉 Yangi yil munosabati bilan barcha premium xizmatlar 50% chegirma!',
      sentCount: 12450,
      openRate: 45.2,
      clickRate: 12.8,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: '2',
      name: 'Ishchilarga yangi ishlar',
      type: 'email',
      status: 'active',
      targetAudience: 'workers',
      message: 'Sizning ko\'nikmalaringizga mos 50+ yangi ish o\'rinlari!',
      sentCount: 5230,
      openRate: 38.5,
      clickRate: 8.2,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: '3',
      name: 'Premium taklif',
      type: 'sms',
      status: 'scheduled',
      targetAudience: 'employers',
      message: 'Premium obuna - birinchi oy bepul! Hoziroq sinab ko\'ring.',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Faolsiz foydalanuvchilar',
      type: 'push',
      status: 'draft',
      targetAudience: 'inactive',
      message: 'Sizni sog\'indik! Qaytib keling va yangi imkoniyatlarni ko\'ring.',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: '1',
      code: 'NEWYEAR2026',
      discountType: 'percent',
      discountValue: 50,
      usageLimit: 1000,
      usedCount: 234,
      validFrom: '2026-01-01',
      validTo: '2026-01-31',
      isActive: true,
    },
    {
      id: '2',
      code: 'FIRST10',
      discountType: 'percent',
      discountValue: 10,
      usageLimit: 0,
      usedCount: 1520,
      validFrom: '2025-01-01',
      validTo: '2026-12-31',
      isActive: true,
    },
    {
      id: '3',
      code: 'VIP50K',
      discountType: 'fixed',
      discountValue: 50000,
      usageLimit: 100,
      usedCount: 100,
      validFrom: '2025-12-01',
      validTo: '2025-12-31',
      isActive: false,
    },
  ]);

  const [banners] = useState<Banner[]>([
    {
      id: '1',
      title: 'Premium obuna - 50% chegirma',
      imageUrl: '/banners/premium-offer.jpg',
      linkUrl: '/premium',
      position: 'homepage',
      isActive: true,
      clicks: 1234,
      impressions: 45000,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    },
    {
      id: '2',
      title: 'IT ishlar haftaligi',
      imageUrl: '/banners/it-week.jpg',
      linkUrl: '/jobs?category=it',
      position: 'search',
      isActive: true,
      clicks: 567,
      impressions: 12000,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    },
  ]);

  const referralStats: ReferralStats = {
    totalReferrals: 1234,
    successfulReferrals: 892,
    pendingReferrals: 342,
    totalBonusPaid: 44600000,
  };

  const handleSendCampaign = async () => {
    if (!newCampaign.name || !newCampaign.message) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    setSendingCampaign(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSendingCampaign(false);
    setShowNewCampaignDialog(false);
    setNewCampaign({
      name: '',
      type: 'push',
      targetAudience: 'all',
      title: '',
      message: '',
      scheduleType: 'now',
      scheduledAt: '',
    });
    
    toast.success('Kampaniya muvaffaqiyatli yuborildi!');
  };

  const handleCreatePromo = () => {
    if (!newPromo.code) {
      toast.error('Promo kodni kiriting');
      return;
    }

    const promo: PromoCode = {
      id: Date.now().toString(),
      code: newPromo.code.toUpperCase(),
      discountType: newPromo.discountType,
      discountValue: newPromo.discountValue,
      usageLimit: newPromo.usageLimit,
      usedCount: 0,
      validFrom: newPromo.validFrom || new Date().toISOString().split('T')[0],
      validTo: newPromo.validTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
    };

    setPromoCodes(prev => [promo, ...prev]);
    setShowNewPromoDialog(false);
    setNewPromo({
      code: '',
      discountType: 'percent',
      discountValue: 10,
      usageLimit: 100,
      validFrom: '',
      validTo: '',
    });
    
    toast.success('Promo kod yaratildi!');
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPromo(prev => ({ ...prev, code }));
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kod nusxalandi!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Yuborildi</Badge>;
      case 'active':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Faol</Badge>;
      case 'scheduled':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Rejalashtirilgan</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Qoralama</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <Bell className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'campaigns', label: 'Kampaniyalar', icon: Megaphone },
    { id: 'banners', label: 'Bannerlar', icon: Image },
    { id: 'promo', label: 'Promo kodlar', icon: Tag },
    { id: 'referral', label: 'Referral', icon: Gift },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
          <Megaphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing Tools</h1>
          <p className="text-sm text-muted-foreground">Kampaniyalar va reklamalar boshqaruvi</p>
        </div>
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
                className={activeTab === tab.id ? 'bg-gradient-to-r from-pink-500 to-rose-500' : ''}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Yuborilgan</p>
                    <p className="text-2xl font-bold text-blue-500">24</p>
                  </div>
                  <Send className="w-8 h-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">O'rtacha ochilish</p>
                    <p className="text-2xl font-bold text-emerald-500">42.3%</p>
                  </div>
                  <Eye className="w-8 h-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">O'rtacha CTR</p>
                    <p className="text-2xl font-bold text-purple-500">8.7%</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Jami auditoriya</p>
                    <p className="text-2xl font-bold text-amber-500">45.2K</p>
                  </div>
                  <Users className="w-8 h-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kampaniyalar</CardTitle>
                <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-rose-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Yangi kampaniya
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Yangi kampaniya yaratish</DialogTitle>
                      <DialogDescription>
                        Foydalanuvchilarga xabar yuborish
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Kampaniya nomi</Label>
                        <Input
                          placeholder="Masalan: Yangi yil aksiyasi"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Xabar turi</Label>
                          <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={newCampaign.type}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value as any }))}
                          >
                            <option value="push">Push notification</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Auditoriya</Label>
                          <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={newCampaign.targetAudience}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                          >
                            <option value="all">Barcha foydalanuvchilar</option>
                            <option value="workers">Faqat ishchilar</option>
                            <option value="employers">Faqat ish beruvchilar</option>
                            <option value="inactive">Faolsiz foydalanuvchilar</option>
                          </select>
                        </div>
                      </div>

                      {newCampaign.type === 'push' && (
                        <div className="space-y-2">
                          <Label>Sarlavha</Label>
                          <Input
                            placeholder="Push notification sarlavhasi"
                            value={newCampaign.title}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Xabar matni</Label>
                        <Textarea
                          placeholder="Xabar matnini kiriting..."
                          value={newCampaign.message}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {newCampaign.message.length}/500
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Yuborish vaqti</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="scheduleType"
                              checked={newCampaign.scheduleType === 'now'}
                              onChange={() => setNewCampaign(prev => ({ ...prev, scheduleType: 'now' }))}
                            />
                            <span>Hozir yuborish</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="scheduleType"
                              checked={newCampaign.scheduleType === 'scheduled'}
                              onChange={() => setNewCampaign(prev => ({ ...prev, scheduleType: 'scheduled' }))}
                            />
                            <span>Rejalashtirish</span>
                          </label>
                        </div>
                        {newCampaign.scheduleType === 'scheduled' && (
                          <Input
                            type="datetime-local"
                            value={newCampaign.scheduledAt}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledAt: e.target.value }))}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewCampaignDialog(false)}>
                        Bekor qilish
                      </Button>
                      <Button 
                        onClick={handleSendCampaign} 
                        disabled={sendingCampaign}
                        className="bg-gradient-to-r from-pink-500 to-rose-500"
                      >
                        {sendingCampaign ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Yuborilmoqda...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Yuborish
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          campaign.type === 'push' ? 'bg-blue-500/20 text-blue-500' :
                          campaign.type === 'email' ? 'bg-purple-500/20 text-purple-500' :
                          'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {getTypeIcon(campaign.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{campaign.name}</span>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {campaign.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {campaign.targetAudience === 'all' ? 'Barchasi' :
                               campaign.targetAudience === 'workers' ? 'Ishchilar' :
                               campaign.targetAudience === 'employers' ? 'Ish beruvchilar' : 'Faolsiz'}
                            </span>
                            {campaign.sentCount && (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" />
                                {campaign.sentCount.toLocaleString()} yuborildi
                              </span>
                            )}
                            {campaign.openRate && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {campaign.openRate}% ochildi
                              </span>
                            )}
                            {campaign.clickRate && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {campaign.clickRate}% bosildi
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promo' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Promo kodlar</CardTitle>
                <Dialog open={showNewPromoDialog} onOpenChange={setShowNewPromoDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-rose-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Yangi promo kod
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yangi promo kod yaratish</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Promo kod</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="PROMO2026"
                            value={newPromo.code}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="font-mono"
                          />
                          <Button variant="outline" onClick={generatePromoCode}>
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Chegirma turi</Label>
                          <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={newPromo.discountType}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, discountType: e.target.value as any }))}
                          >
                            <option value="percent">Foiz (%)</option>
                            <option value="fixed">Belgilangan summa</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Qiymat</Label>
                          <Input
                            type="number"
                            value={newPromo.discountValue}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, discountValue: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Foydalanish limiti (0 = cheksiz)</Label>
                        <Input
                          type="number"
                          value={newPromo.usageLimit}
                          onChange={(e) => setNewPromo(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Boshlanish sanasi</Label>
                          <Input
                            type="date"
                            value={newPromo.validFrom}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, validFrom: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tugash sanasi</Label>
                          <Input
                            type="date"
                            value={newPromo.validTo}
                            onChange={(e) => setNewPromo(prev => ({ ...prev, validTo: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewPromoDialog(false)}>
                        Bekor qilish
                      </Button>
                      <Button onClick={handleCreatePromo} className="bg-gradient-to-r from-pink-500 to-rose-500">
                        Yaratish
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {promoCodes.map(promo => (
                  <div
                    key={promo.id}
                    className={`p-4 rounded-xl border ${
                      promo.isActive 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          promo.isActive ? 'bg-emerald-500/20' : 'bg-gray-500/20'
                        }`}>
                          <Tag className={`w-6 h-6 ${promo.isActive ? 'text-emerald-500' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-lg font-bold font-mono">{promo.code}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyPromoCode(promo.code)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            {promo.isActive ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400">Faol</Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400">Tugagan</Badge>
                            )}
                          </div>
                          <p className="text-lg font-semibold mt-1">
                            {promo.discountType === 'percent' 
                              ? `${promo.discountValue}% chegirma`
                              : `${promo.discountValue.toLocaleString()} so'm`
                            }
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {promo.usedCount} / {promo.usageLimit || '∞'} ishlatilgan
                            </span>
                            <span>
                              {promo.validFrom} - {promo.validTo}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={promo.isActive} />
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bannerlar</CardTitle>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500">
                <Plus className="w-4 h-4 mr-2" />
                Yangi banner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {banners.map(banner => (
                <div
                  key={banner.id}
                  className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
                    <Image className="w-12 h-12 text-white/50" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{banner.title}</span>
                        {banner.isActive && <Badge className="bg-emerald-500/20 text-emerald-400">Faol</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {banner.position === 'homepage' ? 'Bosh sahifa' :
                         banner.position === 'search' ? 'Qidiruv' : 'Popup'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{banner.impressions.toLocaleString()} ko'rish</span>
                        <span>{banner.clicks.toLocaleString()} bosish</span>
                        <span>{((banner.clicks / banner.impressions) * 100).toFixed(1)}% CTR</span>
                      </div>
                    </div>
                    <Switch checked={banner.isActive} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Tab */}
      {activeTab === 'referral' && (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Jami referrallar</p>
                    <p className="text-2xl font-bold text-purple-500">{referralStats.totalReferrals}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Muvaffaqiyatli</p>
                    <p className="text-2xl font-bold text-emerald-500">{referralStats.successfulReferrals}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Kutilmoqda</p>
                    <p className="text-2xl font-bold text-amber-500">{referralStats.pendingReferrals}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">To'langan bonus</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {(referralStats.totalBonusPaid / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <Gift className="w-8 h-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Referral dasturi sozlamalari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Taklif qiluvchiga bonus</Label>
                  <Input type="number" defaultValue={50000} />
                  <p className="text-xs text-muted-foreground">so'm</p>
                </div>
                <div className="space-y-2">
                  <Label>Taklif qilinuvchiga bonus</Label>
                  <Input type="number" defaultValue={25000} />
                  <p className="text-xs text-muted-foreground">so'm</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div>
                  <p className="font-medium">Referral dasturi</p>
                  <p className="text-sm text-muted-foreground">Foydalanuvchilar do'stlarini taklif qilishlari mumkin</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Marketing analitikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Marketing analitikasi tez orada qo'shiladi</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
