import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  Activity,
  Key,
  Fingerprint,
  RefreshCw,
  Download,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';

interface LoginAttempt {
  id: string;
  userId?: string;
  userPhone?: string;
  userName?: string;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  status: 'success' | 'failed' | 'blocked';
  reason?: string;
  createdAt: string;
}

interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedBy: string;
  blockedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'brute_force' | 'suspicious_login' | 'multiple_devices' | 'vpn_detected' | 'bot_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  userId?: string;
  ipAddress: string;
  isResolved: boolean;
  createdAt: string;
}

export function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'login_logs' | 'ip_management' | 'alerts' | '2fa' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddIPDialog, setShowAddIPDialog] = useState(false);
  const [newBlockedIP, setNewBlockedIP] = useState({ ip: '', reason: '', duration: '24h' });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    requireStrongPassword: true,
    blockVPN: false,
    blockTor: true,
    geoBlocking: false,
  });

  // Demo data
  const [loginAttempts] = useState<LoginAttempt[]>([
    {
      id: '1',
      userId: 'user-1',
      userPhone: '+998901234567',
      userName: 'Aziz Karimov',
      ipAddress: '192.168.1.100',
      device: 'iPhone 14',
      browser: 'Safari Mobile',
      location: 'Toshkent, Uzbekistan',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '2',
      userPhone: '+998991112233',
      ipAddress: '10.0.0.50',
      device: 'Windows PC',
      browser: 'Chrome 120',
      location: 'Samarqand, Uzbekistan',
      status: 'failed',
      reason: 'Noto\'g\'ri parol',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      ipAddress: '45.33.32.156',
      device: 'Unknown',
      browser: 'Bot/Crawler',
      location: 'Unknown',
      status: 'blocked',
      reason: 'Brute force attack',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '4',
      userId: 'user-2',
      userPhone: '+998912345678',
      userName: 'Nodira Saidova',
      ipAddress: '192.168.1.105',
      device: 'Samsung Galaxy S23',
      browser: 'Chrome Mobile',
      location: 'Buxoro, Uzbekistan',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ]);

  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([
    {
      id: '1',
      ipAddress: '45.33.32.156',
      reason: 'Brute force attack - 50+ failed attempts',
      blockedBy: 'System (Auto)',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
      isActive: true,
    },
    {
      id: '2',
      ipAddress: '103.21.244.0/22',
      reason: 'Known malicious IP range',
      blockedBy: 'Admin',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      isActive: true,
    },
  ]);

  const [securityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'brute_force',
      severity: 'critical',
      message: 'Brute force attack aniqlandi',
      details: '50+ muvaffaqiyatsiz login urinishi 5 daqiqada',
      ipAddress: '45.33.32.156',
      isResolved: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      type: 'suspicious_login',
      severity: 'medium',
      message: 'G\'ayrioddiy joylashuvdan kirish',
      details: 'Foydalanuvchi odatda Toshkentdan kiradi, hozir Rossiyadan',
      userId: 'user-5',
      ipAddress: '95.108.213.45',
      isResolved: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '3',
      type: 'multiple_devices',
      severity: 'low',
      message: 'Bir vaqtda ko\'p qurilmadan kirish',
      details: '3 ta qurilmadan bir vaqtda aktiv sessiya',
      userId: 'user-3',
      ipAddress: '192.168.1.100',
      isResolved: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Muvaffaqiyatli</Badge>;
      case 'failed':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Muvaffaqiyatsiz</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Bloklangan</Badge>;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">Kritik</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Yuqori</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">O'rta</Badge>;
      case 'low':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Past</Badge>;
      default:
        return null;
    }
  };

  const handleBlockIP = () => {
    if (!newBlockedIP.ip) {
      toast.error('IP manzilni kiriting');
      return;
    }
    
    const newIP: BlockedIP = {
      id: Date.now().toString(),
      ipAddress: newBlockedIP.ip,
      reason: newBlockedIP.reason || 'Admin tomonidan bloklangan',
      blockedBy: 'Admin',
      blockedAt: new Date().toISOString(),
      expiresAt: newBlockedIP.duration !== 'permanent' 
        ? new Date(Date.now() + parseInt(newBlockedIP.duration) * 60 * 60 * 1000).toISOString()
        : undefined,
      isActive: true,
    };
    
    setBlockedIPs(prev => [newIP, ...prev]);
    setNewBlockedIP({ ip: '', reason: '', duration: '24h' });
    setShowAddIPDialog(false);
    toast.success(`${newBlockedIP.ip} bloklandi`);
  };

  const handleUnblockIP = (id: string) => {
    setBlockedIPs(prev => prev.filter(ip => ip.id !== id));
    toast.success('IP blokdan chiqarildi');
  };

  const tabs = [
    { id: 'overview', label: 'Umumiy', icon: Shield },
    { id: 'login_logs', label: 'Login tarixi', icon: Clock },
    { id: 'ip_management', label: 'IP boshqaruvi', icon: Globe },
    { id: 'alerts', label: 'Ogohlantirishlar', icon: ShieldAlert },
    { id: '2fa', label: '2FA sozlamalari', icon: Fingerprint },
    { id: 'audit', label: 'Audit log', icon: Activity },
  ] as const;

  const securityStats = {
    totalLogins: loginAttempts.length,
    successfulLogins: loginAttempts.filter(l => l.status === 'success').length,
    failedLogins: loginAttempts.filter(l => l.status === 'failed').length,
    blockedAttempts: loginAttempts.filter(l => l.status === 'blocked').length,
    activeAlerts: securityAlerts.filter(a => !a.isResolved).length,
    blockedIPs: blockedIPs.filter(ip => ip.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Xavfsizlik Markazi</h1>
          <p className="text-sm text-muted-foreground">Tizim xavfsizligini boshqarish</p>
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
                className={activeTab === tab.id ? 'bg-gradient-to-r from-red-500 to-orange-500' : ''}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.id === 'alerts' && securityStats.activeAlerts > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">{securityStats.activeAlerts}</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Muvaffaqiyatli</p>
                    <p className="text-2xl font-bold text-emerald-500">{securityStats.successfulLogins}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Muvaffaqiyatsiz</p>
                    <p className="text-2xl font-bold text-amber-500">{securityStats.failedLogins}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bloklangan</p>
                    <p className="text-2xl font-bold text-red-500">{securityStats.blockedAttempts}</p>
                  </div>
                  <Ban className="w-8 h-8 text-red-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktiv ogohlantirishlar</p>
                    <p className="text-2xl font-bold text-purple-500">{securityStats.activeAlerts}</p>
                  </div>
                  <ShieldAlert className="w-8 h-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Xavfsizlik holati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-emerald-500" />
                    <span>SSL/TLS</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Faol</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-amber-500" />
                    <span>2FA</span>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400">O'chirilgan</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span>Firewall</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Faol</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span>DDoS himoya</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Faol</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                So'nggi ogohlantirishlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.slice(0, 3).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${
                      alert.isResolved 
                        ? 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          <span className="font-medium">{alert.message}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.details}</p>
                        <p className="text-xs text-muted-foreground">
                          IP: {alert.ipAddress} • {new Date(alert.createdAt).toLocaleString('uz-UZ')}
                        </p>
                      </div>
                      {alert.isResolved ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400">Hal qilindi</Badge>
                      ) : (
                        <Button size="sm" variant="outline">Hal qilish</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Login Logs Tab */}
      {activeTab === 'login_logs' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Login tarixi</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginAttempts.map(attempt => (
                <div
                  key={attempt.id}
                  className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        attempt.status === 'success' ? 'bg-emerald-500/20' :
                        attempt.status === 'failed' ? 'bg-amber-500/20' : 'bg-red-500/20'
                      }`}>
                        {attempt.device.includes('iPhone') || attempt.device.includes('Samsung') ? (
                          <Smartphone className={`w-5 h-5 ${
                            attempt.status === 'success' ? 'text-emerald-500' :
                            attempt.status === 'failed' ? 'text-amber-500' : 'text-red-500'
                          }`} />
                        ) : (
                          <Monitor className={`w-5 h-5 ${
                            attempt.status === 'success' ? 'text-emerald-500' :
                            attempt.status === 'failed' ? 'text-amber-500' : 'text-red-500'
                          }`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{attempt.userName || attempt.userPhone || 'Noma\'lum'}</span>
                          {getStatusBadge(attempt.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {attempt.device} • {attempt.browser}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {attempt.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {attempt.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(attempt.createdAt).toLocaleString('uz-UZ')}
                          </span>
                        </div>
                        {attempt.reason && (
                          <p className="text-sm text-red-400 mt-2">Sabab: {attempt.reason}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IP Management Tab */}
      {activeTab === 'ip_management' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bloklangan IP manzillar</CardTitle>
                <Dialog open={showAddIPDialog} onOpenChange={setShowAddIPDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-red-500 to-orange-500">
                      <Plus className="w-4 h-4 mr-2" />
                      IP bloklash
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yangi IP bloklash</DialogTitle>
                      <DialogDescription>
                        IP manzil yoki IP diapazonini kiriting
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>IP manzil</Label>
                        <Input
                          placeholder="192.168.1.100 yoki 192.168.1.0/24"
                          value={newBlockedIP.ip}
                          onChange={(e) => setNewBlockedIP(prev => ({ ...prev, ip: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sabab</Label>
                        <Input
                          placeholder="Bloklash sababi"
                          value={newBlockedIP.reason}
                          onChange={(e) => setNewBlockedIP(prev => ({ ...prev, reason: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Muddat</Label>
                        <select
                          className="w-full p-2 rounded-md border bg-background"
                          value={newBlockedIP.duration}
                          onChange={(e) => setNewBlockedIP(prev => ({ ...prev, duration: e.target.value }))}
                        >
                          <option value="1">1 soat</option>
                          <option value="24">24 soat</option>
                          <option value="168">1 hafta</option>
                          <option value="720">1 oy</option>
                          <option value="permanent">Doimiy</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddIPDialog(false)}>Bekor qilish</Button>
                      <Button onClick={handleBlockIP} className="bg-red-500 hover:bg-red-600">Bloklash</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedIPs.map(ip => (
                  <div
                    key={ip.id}
                    className="p-4 rounded-xl bg-red-500/5 border border-red-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Ban className="w-5 h-5 text-red-500" />
                          <span className="font-mono font-medium">{ip.ipAddress}</span>
                          {ip.isActive && <Badge className="bg-red-500/20 text-red-400">Aktiv</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{ip.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Bloklagan: {ip.blockedBy} • {new Date(ip.blockedAt).toLocaleString('uz-UZ')}
                          {ip.expiresAt && ` • Tugash: ${new Date(ip.expiresAt).toLocaleString('uz-UZ')}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockIP(ip.id)}
                        className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Blokdan chiqarish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Xavfsizlik ogohlantirishlari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.isResolved 
                      ? 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                      : alert.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/5 border-amber-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(alert.severity)}
                        <span className="font-medium">{alert.message}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>IP: {alert.ipAddress}</span>
                        <span>{new Date(alert.createdAt).toLocaleString('uz-UZ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.isResolved ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Hal qilindi
                        </Badge>
                      ) : (
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                          Hal qilish
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2FA Settings Tab */}
      {activeTab === '2fa' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Ikki bosqichli tasdiqlash (2FA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-500">2FA hozirda o'chirilgan</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Admin akkauntingiz xavfsizligini oshirish uchun 2FA ni yoqishni tavsiya qilamiz.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS orqali 2FA</p>
                    <p className="text-sm text-muted-foreground">Telefon raqamingizga kod yuboriladi</p>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">Google Authenticator yoki Authy</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Sozlash</Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-4">Qo'shimcha xavfsizlik</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Login bildirishnomalari</p>
                    <p className="text-xs text-muted-foreground">Har bir kirishda SMS yuborish</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Shubhali faoliyat ogohlantirishlari</p>
                    <p className="text-xs text-muted-foreground">G'ayrioddiy faoliyat aniqlanganda</p>
                  </div>
                  <Switch
                    checked={securitySettings.suspiciousActivityAlerts}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, suspiciousActivityAlerts: checked }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit log</CardTitle>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Eksport
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'User bloklandi', user: 'Admin', target: '+998901234567', time: '5 daqiqa oldin', icon: Ban, color: 'red' },
                { action: 'Ish e\'loni tasdiqlandi', user: 'Admin', target: 'Senior Developer', time: '15 daqiqa oldin', icon: CheckCircle, color: 'green' },
                { action: 'IP bloklandi', user: 'System', target: '45.33.32.156', time: '30 daqiqa oldin', icon: Shield, color: 'amber' },
                { action: 'Sozlamalar o\'zgartirildi', user: 'Admin', target: 'Security settings', time: '1 soat oldin', icon: Settings, color: 'blue' },
                { action: 'Admin login', user: 'Admin', target: '192.168.1.100', time: '2 soat oldin', icon: Lock, color: 'purple' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <div className={`w-8 h-8 rounded-full bg-${log.color}-500/20 flex items-center justify-center`}>
                    <log.icon className={`w-4 h-4 text-${log.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.user} → {log.target}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
