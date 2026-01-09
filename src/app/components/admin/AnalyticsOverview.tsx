import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Briefcase, UserCheck, Building2, TrendingUp, Activity, Zap, DollarSign, CreditCard, CheckCircle, Gift } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Job, User } from '../../../lib/types';

interface AnalyticsOverviewProps {
  jobs: Job[];
  users: User[];
}

export function AnalyticsOverview({ jobs, users }: AnalyticsOverviewProps) {
  const totalUsers = users.length;
  const workers = users.filter(u => u.userType === 'worker').length;
  const employers = users.filter(u => u.userType === 'employer').length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.deadline ? new Date(j.deadline) > new Date() : (j.status === 'active' || j.status === 'paused')).length;
  
  // Daromad statistikasi
  const paidJobs = jobs.filter(j => j.paymentStatus === 'paid' && (j.status === 'approved' || j.status === 'active' || j.status === 'paused'));
  const freeJobs = jobs.filter(j => (j.paymentStatus === 'free' || !j.paymentStatus) && (j.status === 'approved' || j.status === 'active' || j.status === 'paused'));
  const pendingPaymentJobs = jobs.filter(j => j.paymentStatus === 'pending');
  
  // Narxlar (so'm)
  const JOB_POST_PRICE = 50000;
  const FEATURED_PRICE = 100000;
  const URGENT_PRICE = 75000;
  
  // Daromadni hisoblash
  const totalRevenue = paidJobs.reduce((sum, job) => {
    let price = JOB_POST_PRICE;
    if (job.featured || job.isVip) price += FEATURED_PRICE;
    if (job.isUrgent) price += URGENT_PRICE;
    return sum + price;
  }, 0);
  
  // Format so'm
  const formatSom = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const userTypeData = [
    { name: 'Ishchilar', value: workers, color: '#8b5cf6' },
    { name: 'Ish beruvchilar', value: employers, color: '#06b6d4' },
  ];

  const weeklyData = [
    { day: 'Dush', users: 12, jobs: 8 },
    { day: 'Sesh', users: 19, jobs: 12 },
    { day: 'Chor', users: 15, jobs: 10 },
    { day: 'Pay', users: 25, jobs: 18 },
    { day: 'Jum', users: 22, jobs: 15 },
    { day: 'Shan', users: 30, jobs: 22 },
    { day: 'Yak', users: 28, jobs: 20 },
  ];

  interface RegionStats { [key: string]: number; }
  const regionStats = jobs.reduce((acc: RegionStats, job) => {
    const region = job.employerRegion || 'Nomalum';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as RegionStats);

  const regionData = Object.entries(regionStats)
    .map(([name, value]) => ({ name, jobs: value as number }))
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Umumiy ko'rinish</h1>
          <p className="text-sm text-gray-500">Platformaning asosiy statistikasi</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 border-violet-200 dark:border-violet-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Jami foydalanuvchilar</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% so'nggi hafta</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 border-cyan-200 dark:border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ishchilar</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{workers}</div>
            <p className="text-xs text-gray-500 mt-2">{totalUsers > 0 ? Math.round((workers / totalUsers) * 100) : 0}% jami</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ish beruvchilar</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{employers}</div>
            <p className="text-xs text-gray-500 mt-2">{totalUsers > 0 ? Math.round((employers / totalUsers) * 100) : 0}% jami</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Jami ishlar</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalJobs}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              <Zap className="w-3 h-3" />
              <span>{activeJobs} ta aktiv</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daromad statistikasi */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-green-200 dark:border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Jami daromad</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatSom(totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-2">Tasdiqlangan pullik e'lonlardan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pullik e'lonlar</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{paidJobs.length}</div>
            <p className="text-xs text-gray-500 mt-2">To'lov qilingan va tasdiqlangan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-500/10 dark:to-cyan-500/10 border-teal-200 dark:border-teal-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Tekin e'lonlar</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{freeJobs.length}</div>
            <p className="text-xs text-gray-500 mt-2">Tekin rejimda tasdiqlangan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 border-yellow-200 dark:border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">To'lov kutilmoqda</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{pendingPaymentJobs.length}</div>
            <p className="text-xs text-gray-500 mt-2">To'lov tasdiqlanishi kerak</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Haftalik o'sish</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#111' }} />
                <Legend />
                <Line type="monotone" dataKey="users" name="Foydalanuvchilar" stroke="#8b5cf6" strokeWidth={3} />
                <Line type="monotone" dataKey="jobs" name="Ishlar" stroke="#06b6d4" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Foydalanuvchilar taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={userTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                  {userTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#111' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Viloyatlar bo'yicha ishlar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#111' }} />
              <Bar dataKey="jobs" name="Ishlar soni" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
