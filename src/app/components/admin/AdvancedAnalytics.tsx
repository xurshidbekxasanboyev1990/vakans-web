import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, TrendingDown, Users, Briefcase, FileText, 
  Clock, Calendar, Activity, BarChart3, PieChart, Target
} from 'lucide-react';
import type { Job, User, Application } from '../../../lib/types';

interface AdvancedAnalyticsProps {
  jobs: Job[];
  users: User[];
  applications: Application[];
}

export function AdvancedAnalytics({ jobs, users, applications }: AdvancedAnalyticsProps) {
  // Time-based data
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter by time
  const getByDate = <T extends { createdAt?: string }>(items: T[], start: Date, end: Date = now) => {
    return items.filter(item => {
      if (!item.createdAt) return false;
      const date = new Date(item.createdAt);
      return date >= start && date <= end;
    });
  };

  // Today's stats
  const todayUsers = getByDate(users, today);
  const todayJobs = getByDate(jobs, today);
  const todayApplications = getByDate(applications, today);

  // This week stats
  const weekUsers = getByDate(users, weekAgo);
  const weekJobs = getByDate(jobs, weekAgo);
  const weekApplications = getByDate(applications, weekAgo);

  // Category stats
  const categoryStats = jobs.reduce((acc, job) => {
    acc[job.category] = (acc[job.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Region stats
  const regionStats = users.reduce((acc, user) => {
    const region = user.region || 'Nomalum';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sortedRegions = Object.entries(regionStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Conversion rate
  const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
  const conversionRate = applications.length > 0 
    ? ((acceptedApplications / applications.length) * 100).toFixed(1)
    : '0';

  // Hourly activity (heatmap data)
  const hourlyActivity = Array(24).fill(0);
  applications.forEach(app => {
    const hour = new Date(app.createdAt).getHours();
    hourlyActivity[hour]++;
  });
  const maxActivity = Math.max(...hourlyActivity, 1);

  // Daily activity for the week
  const dailyActivity = Array(7).fill(0).map((_, i) => {
    const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return {
      day: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'][date.getDay()],
      count: getByDate(applications, date, nextDate).length
    };
  });
  const maxDailyActivity = Math.max(...dailyActivity.map(d => d.count), 1);

  // Growth calculations
  const previousWeekUsers = users.filter(u => {
    const date = new Date(u.createdAt || '');
    const twoWeeksAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= twoWeeksAgo && date < weekAgo;
  }).length;
  const userGrowth = previousWeekUsers > 0 
    ? (((weekUsers.length - previousWeekUsers) / previousWeekUsers) * 100).toFixed(0)
    : '100';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Kengaytirilgan analitika</h1>
        <p className="text-sm text-muted-foreground mt-1">Tizim faoliyati va konversiya statistikasi</p>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Bugun yangi</p>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{todayUsers.length}</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">foydalanuvchi</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Bugun yangi</p>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{todayJobs.length}</div>
                <p className="text-xs text-green-600 dark:text-green-400">ish e'loni</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Bugun yangi</p>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{todayApplications.length}</div>
                <p className="text-xs text-purple-600 dark:text-purple-400">ariza</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 dark:text-orange-400">Konversiya</p>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{conversionRate}%</div>
                <p className="text-xs text-orange-600 dark:text-orange-400">qabul darajasi</p>
              </div>
              <Target className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Haftalik o'sish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{weekUsers.length}</div>
              <p className="text-sm text-muted-foreground">Yangi foydalanuvchilar</p>
              <Badge className={parseInt(userGrowth) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {parseInt(userGrowth) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {userGrowth}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{weekJobs.length}</div>
              <p className="text-sm text-muted-foreground">Yangi ishlar</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{weekApplications.length}</div>
              <p className="text-sm text-muted-foreground">Yangi arizalar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Kunlik faollik (arizalar)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {dailyActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                    style={{ height: `${(day.count / maxDailyActivity) * 120}px`, minHeight: day.count > 0 ? '8px' : '0' }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <span className="text-xs font-medium">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Eng faol vaqtlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1">
              {hourlyActivity.map((count, hour) => {
                const intensity = count / maxActivity;
                return (
                  <div
                    key={hour}
                    className="aspect-square rounded-sm transition-all hover:scale-110 cursor-default"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${0.1 + intensity * 0.9})`,
                    }}
                    title={`${hour}:00 - ${count} ta ariza`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Kam</span>
              <div className="flex gap-0.5">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Ko'p</span>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5" />
              Kategoriyalar bo'yicha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedCategories.map(([category, count], i) => {
                const percentage = ((count / jobs.length) * 100).toFixed(0);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Regions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              Viloyatlar bo'yicha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedRegions.map(([region, count], i) => {
                const percentage = ((count / users.length) * 100).toFixed(0);
                const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-violet-500'];
                return (
                  <div key={region}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{region}</span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5" />
            Konversiya funneli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center flex-1">
              <div className="h-24 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{jobs.length}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Ishlar</p>
                </div>
              </div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center flex-1">
              <div className="h-20 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{applications.length}</div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Arizalar</p>
                </div>
              </div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center flex-1">
              <div className="h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{acceptedApplications}</div>
                  <p className="text-xs text-green-600 dark:text-green-400">Qabul</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Konversiya: {conversionRate}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
