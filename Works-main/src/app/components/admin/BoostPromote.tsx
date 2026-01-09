import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Rocket,
  Star,
  Zap,
  Crown,
  TrendingUp,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  Package,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  CreditCard,
  Target,
  Award,
  Sparkles,
  ArrowUp,
  Calendar,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface BoostPackage {
  id: string;
  name: string;
  nameUz: string;
  price: number;
  duration: number; // days
  multiplier: number; // visibility boost
  features: string[];
  color: string;
  icon: 'star' | 'zap' | 'crown' | 'rocket';
  isActive: boolean;
  totalSold: number;
  revenue: number;
}

interface BoostedJob {
  id: string;
  title: string;
  company: string;
  packageId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  views: number;
  applications: number;
  paid: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface Transaction {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
}

const BoostPromote: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('packages');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Demo packages
  const [packages, setPackages] = useState<BoostPackage[]>([
    {
      id: '1',
      name: 'Basic Boost',
      nameUz: 'Oddiy Boost',
      price: 50000,
      duration: 7,
      multiplier: 2,
      features: [
        'E\'lon tepaga chiqadi',
        '2x ko\'rinish',
        '7 kun davomida'
      ],
      color: 'bg-blue-500',
      icon: 'star',
      isActive: true,
      totalSold: 245,
      revenue: 12250000
    },
    {
      id: '2',
      name: 'Pro Boost',
      nameUz: 'Pro Boost',
      price: 100000,
      duration: 14,
      multiplier: 5,
      features: [
        'E\'lon eng tepada',
        '5x ko\'rinish',
        'Maxsus badge',
        '14 kun davomida'
      ],
      color: 'bg-purple-500',
      icon: 'zap',
      isActive: true,
      totalSold: 156,
      revenue: 15600000
    },
    {
      id: '3',
      name: 'Premium Boost',
      nameUz: 'Premium Boost',
      price: 200000,
      duration: 30,
      multiplier: 10,
      features: [
        'Eng yuqori prioritet',
        '10x ko\'rinish',
        'Premium badge',
        'Push notification',
        '30 kun davomida'
      ],
      color: 'bg-yellow-500',
      icon: 'crown',
      isActive: true,
      totalSold: 89,
      revenue: 17800000
    },
    {
      id: '4',
      name: 'VIP Boost',
      nameUz: 'VIP Boost',
      price: 500000,
      duration: 60,
      multiplier: 20,
      features: [
        'VIP status',
        '20x ko\'rinish',
        'Barcha platformalarda reklama',
        'SMS/Email marketing',
        'Shaxsiy menejer',
        '60 kun davomida'
      ],
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      icon: 'rocket',
      isActive: true,
      totalSold: 34,
      revenue: 17000000
    }
  ]);

  // Demo boosted jobs
  const [boostedJobs, setBoostedJobs] = useState<BoostedJob[]>([
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'Tech Solutions',
      packageId: '3',
      packageName: 'Premium Boost',
      startDate: '2024-01-15',
      endDate: '2024-02-14',
      status: 'active',
      views: 4523,
      applications: 67,
      paid: 200000,
      paymentStatus: 'paid'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      company: 'Digital Agency',
      packageId: '2',
      packageName: 'Pro Boost',
      startDate: '2024-01-10',
      endDate: '2024-01-24',
      status: 'active',
      views: 2341,
      applications: 34,
      paid: 100000,
      paymentStatus: 'paid'
    },
    {
      id: '3',
      title: 'Accountant',
      company: 'Finance Corp',
      packageId: '1',
      packageName: 'Basic Boost',
      startDate: '2024-01-01',
      endDate: '2024-01-08',
      status: 'expired',
      views: 1256,
      applications: 12,
      paid: 50000,
      paymentStatus: 'paid'
    },
    {
      id: '4',
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      packageId: '4',
      packageName: 'VIP Boost',
      startDate: '2024-01-18',
      endDate: '2024-03-18',
      status: 'active',
      views: 8934,
      applications: 123,
      paid: 500000,
      paymentStatus: 'paid'
    }
  ]);

  // Demo transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      jobId: '1',
      jobTitle: 'Senior React Developer',
      employerId: 'E001',
      employerName: 'Tech Solutions',
      packageName: 'Premium Boost',
      amount: 200000,
      paymentMethod: 'Payme',
      status: 'completed',
      date: '2024-01-15 14:32:00'
    },
    {
      id: 'TXN002',
      jobId: '2',
      jobTitle: 'Marketing Manager',
      employerId: 'E002',
      employerName: 'Digital Agency',
      packageName: 'Pro Boost',
      amount: 100000,
      paymentMethod: 'Click',
      status: 'completed',
      date: '2024-01-10 09:15:00'
    },
    {
      id: 'TXN003',
      jobId: '4',
      jobTitle: 'UI/UX Designer',
      employerId: 'E003',
      employerName: 'Creative Studio',
      packageName: 'VIP Boost',
      amount: 500000,
      paymentMethod: 'Uzcard',
      status: 'completed',
      date: '2024-01-18 16:45:00'
    },
    {
      id: 'TXN004',
      jobId: '5',
      jobTitle: 'Project Manager',
      employerId: 'E004',
      employerName: 'Startup Inc',
      packageName: 'Basic Boost',
      amount: 50000,
      paymentMethod: 'Payme',
      status: 'pending',
      date: '2024-01-20 11:22:00'
    }
  ]);

  // Edit package modal state
  const [editingPackage, setEditingPackage] = useState<BoostPackage | null>(null);
  const [showAddPackage, setShowAddPackage] = useState(false);

  const getPackageIcon = (icon: string) => {
    switch (icon) {
      case 'star': return <Star className="h-6 w-6" />;
      case 'zap': return <Zap className="h-6 w-6" />;
      case 'crown': return <Crown className="h-6 w-6" />;
      case 'rocket': return <Rocket className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Faol</Badge>;
      case 'expired':
        return <Badge variant="secondary">Tugagan</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Kutilmoqda</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Bajarildi</Badge>;
      case 'failed':
        return <Badge variant="destructive">Xato</Badge>;
      case 'refunded':
        return <Badge variant="outline">Qaytarildi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate total stats
  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.revenue, 0);
  const totalSold = packages.reduce((sum, pkg) => sum + pkg.totalSold, 0);
  const activeBoosts = boostedJobs.filter(j => j.status === 'active').length;

  // Filter boosted jobs
  const filteredJobs = boostedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jami daromad</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Jami sotilgan</p>
                <p className="text-2xl font-bold">{totalSold}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Faol boostlar</p>
                <p className="text-2xl font-bold">{activeBoosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">O'rtacha boost narxi</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue / totalSold || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Paketlar
          </TabsTrigger>
          <TabsTrigger value="boosted" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Boostlar
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            To'lovlar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistika
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Boost Paketlari</h3>
            <Button onClick={() => setShowAddPackage(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yangi paket
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`relative overflow-hidden ${!pkg.isActive ? 'opacity-60' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-2 ${pkg.color}`}></div>
                <CardHeader className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full ${pkg.color} text-white`}>
                      {getPackageIcon(pkg.icon)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPackage(pkg)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    {language === 'uz' ? pkg.nameUz : pkg.name}
                  </CardTitle>
                  <CardDescription>
                    {pkg.duration} kun • {pkg.multiplier}x ko'rinish
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">
                    {formatCurrency(pkg.price)}
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sotilgan:</span>
                      <span className="font-medium">{pkg.totalSold}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Daromad:</span>
                      <span className="font-medium text-green-600">{formatCurrency(pkg.revenue)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Badge className={pkg.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                    {pkg.isActive ? 'Faol' : 'Nofaol'}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Boosted Jobs Tab */}
        <TabsContent value="boosted" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" aria-label="Holat filtri">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="expired">Tugagan</SelectItem>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yangilash
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E'lon</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muddat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ko'rishlar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arizalar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To'lov</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-500">{job.company}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{job.packageName}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p>{job.startDate}</p>
                            <p className="text-gray-500">→ {job.endDate}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            {job.views.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-gray-400" />
                            {job.applications}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-green-600">{formatCurrency(job.paid)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">To'lov tarixi</h3>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]" aria-label="To'lov holati">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="completed">Bajarildi</SelectItem>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="failed">Xato</SelectItem>
                  <SelectItem value="refunded">Qaytarildi</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Sana
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E'lon</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ish beruvchi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To'lov usuli</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 font-mono text-sm">{txn.id}</td>
                        <td className="px-4 py-3">{txn.jobTitle}</td>
                        <td className="px-4 py-3">{txn.employerName}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{txn.packageName}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-green-600">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{txn.paymentMethod}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(txn.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{txn.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Paketlar bo'yicha sotuvlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${pkg.color} text-white`}>
                        {getPackageIcon(pkg.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{pkg.nameUz}</span>
                          <span className="text-sm text-gray-500">{pkg.totalSold} ta</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pkg.color}`}
                            style={{ width: `${(pkg.totalSold / totalSold) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(pkg.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Haftalik daromad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map((day, idx) => {
                    const revenue = Math.floor(Math.random() * 3000000) + 500000;
                    const maxRevenue = 3500000;
                    return (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-12 text-sm text-gray-500">{day}</span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div
                              className="h-4 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                              style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium w-32 text-right">{formatCurrency(revenue)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>To'lov usullari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Payme', percentage: 45, color: 'bg-blue-500' },
                    { name: 'Click', percentage: 30, color: 'bg-green-500' },
                    { name: 'Uzcard', percentage: 20, color: 'bg-yellow-500' },
                    { name: 'Boshqa', percentage: 5, color: 'bg-gray-500' }
                  ].map((method) => (
                    <div key={method.name} className="flex items-center gap-4">
                      <span className="w-20 font-medium">{method.name}</span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${method.color}`}
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{method.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Boost samaradorligi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span>O'rtacha ko'rishlar</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">+347%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>O'rtacha arizalar</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">+256%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span>Yollash tezligi</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">-65%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-600" />
                      <span>Mijoz qoniqishi</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Package Modal would go here */}
    </div>
  );
};

export default BoostPromote;
