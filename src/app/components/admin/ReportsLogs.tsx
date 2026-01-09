import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, FileText, Users, Briefcase, Activity, TrendingUp, BarChart3, PieChart, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import type { Job, User, Application } from '../../../lib/types';

interface ReportsLogsProps {
  jobs: Job[];
  users: User[];
  applications?: Application[];
}

export function ReportsLogs({ jobs, users, applications = [] }: ReportsLogsProps) {
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'users' | 'jobs' | 'applications' | 'all'>('all');
  const [exportFormat, setExportFormat] = useState<'txt' | 'csv' | 'json'>('csv');

  const activityLogs = [
    { id: 1, type: 'user_registered', user: 'Jamshid Aliyev', timestamp: new Date(Date.now() - 1000 * 60 * 15), detail: 'Ishchi royxatdan otdi' },
    { id: 2, type: 'job_posted', user: 'Nodira Karimova', timestamp: new Date(Date.now() - 1000 * 60 * 30), detail: 'Yangi ish elon qildi' },
    { id: 3, type: 'application', user: 'Sardor Tursunov', timestamp: new Date(Date.now() - 1000 * 60 * 45), detail: 'Ishga ariza topshirdi' },
    { id: 4, type: 'job_posted', user: 'Malika Saidova', timestamp: new Date(Date.now() - 1000 * 60 * 60), detail: 'Yangi ish elon qildi' },
    { id: 5, type: 'user_registered', user: 'Aziz Rahimov', timestamp: new Date(Date.now() - 1000 * 60 * 90), detail: 'Ish beruvchi royxatdan otdi' },
  ];

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return seconds + ' soniya oldin';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + ' daqiqa oldin';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + ' soat oldin';
    return Math.floor(hours / 24) + ' kun oldin';
  };

  const getFilteredData = <T extends { createdAt?: string }>(data: T[]) => {
    const now = new Date();
    return data.filter(item => {
      if (!item.createdAt || timePeriod === 'all') return true;
      const itemDate = new Date(item.createdAt);
      if (timePeriod === 'today') return itemDate.toDateString() === now.toDateString();
      if (timePeriod === 'week') return (now.getTime() - itemDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
      if (timePeriod === 'month') return (now.getTime() - itemDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  };

  const filteredJobs = getFilteredData(jobs);
  const filteredUsers = getFilteredData(users);
  const filteredApplications = getFilteredData(applications);
  const workerCount = filteredUsers.filter(u => u.userType === 'worker').length;
  const employerCount = filteredUsers.filter(u => u.userType === 'employer').length;
  const activeJobsCount = filteredJobs.filter(j => j.status === 'active' || j.status === 'paused').length;
  const pendingApps = filteredApplications.filter(a => a.status === 'pending').length;
  const acceptedApps = filteredApplications.filter(a => a.status === 'accepted').length;

  const exportData = () => {
    let content = '';
    const date = new Date().toISOString().split('T')[0];
    if (exportFormat === 'json') {
      const data: Record<string, unknown> = {};
      if (exportType === 'users' || exportType === 'all') data.users = filteredUsers;
      if (exportType === 'jobs' || exportType === 'all') data.jobs = filteredJobs;
      if (exportType === 'applications' || exportType === 'all') data.applications = filteredApplications;
      content = JSON.stringify(data, null, 2);
    } else if (exportFormat === 'csv') {
      if (exportType === 'users' || exportType === 'all') {
        content += 'FOYDALANUVCHILAR\nIsm,Familiya,Turi,Viloyat,Email\n';
        filteredUsers.forEach(u => { content += u.firstName + ',' + u.lastName + ',' + u.userType + ',' + (u.region || '') + ',' + (u.email || '') + '\n'; });
      }
      if (exportType === 'jobs' || exportType === 'all') {
        content += '\nISHLAR\nSarlavha,Ish beruvchi,Viloyat,Status\n';
        filteredJobs.forEach(j => { content += '"' + j.title + '",' + j.employerName + ',' + j.employerRegion + ',' + j.status + '\n'; });
      }
      if (exportType === 'applications' || exportType === 'all') {
        content += '\nARIZALAR\nIsh,Ishchi,Status\n';
        filteredApplications.forEach(a => { content += '"' + a.jobTitle + '",' + a.workerName + ',' + a.status + '\n'; });
      }
    } else {
      if (exportType === 'users' || exportType === 'all') {
        content += 'FOYDALANUVCHILAR\n\n';
        filteredUsers.forEach((u, i) => { content += (i + 1) + '. ' + u.firstName + ' ' + u.lastName + ' (' + u.userType + ')\n'; });
      }
      if (exportType === 'jobs' || exportType === 'all') {
        content += '\nISHLAR\n\n';
        filteredJobs.forEach((j, i) => { content += (i + 1) + '. ' + j.title + ' - ' + j.employerName + '\n'; });
      }
    }
    const ext = exportFormat;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'works_' + exportType + '_' + date + '.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  };

  const getLogIcon = (type: string) => {
    if (type === 'user_registered') return <Users className="w-4 h-4 text-blue-500" />;
    if (type === 'job_posted') return <Briefcase className="w-4 h-4 text-green-500" />;
    if (type === 'application') return <FileText className="w-4 h-4 text-yellow-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hisobotlar va Loglar</h1>
        <p className="text-sm text-muted-foreground mt-1">Tizim faoliyati va malumotlarni export qilish</p>
      </div>

      <Card><CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Davr:</span>
            <Button variant={timePeriod === 'today' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('today')}>Bugun</Button>
            <Button variant={timePeriod === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('week')}>Hafta</Button>
            <Button variant={timePeriod === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('month')}>Oy</Button>
            <Button variant={timePeriod === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('all')}>Barchasi</Button>
          </div>
          <Button onClick={() => setExportModalOpen(true)}><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </CardContent></Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"><CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredUsers.length}</div><div className="text-xs text-blue-600 dark:text-blue-400">Foydalanuvchilar</div></div><Users className="w-8 h-8 text-blue-500 opacity-50" /></div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">{workerCount} ishchi / {employerCount} ish beruvchi</div>
        </CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"><CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-green-700 dark:text-green-300">{filteredJobs.length}</div><div className="text-xs text-green-600 dark:text-green-400">Ishlar</div></div><Briefcase className="w-8 h-8 text-green-500 opacity-50" /></div>
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">{activeJobsCount} aktiv</div>
        </CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"><CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{filteredApplications.length}</div><div className="text-xs text-purple-600 dark:text-purple-400">Arizalar</div></div><FileText className="w-8 h-8 text-purple-500 opacity-50" /></div>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">{pendingApps} kutilmoqda / {acceptedApps} qabul</div>
        </CardContent></Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"><CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{filteredApplications.length > 0 ? Math.round(acceptedApps / filteredApplications.length * 100) : 0}%</div><div className="text-xs text-orange-600 dark:text-orange-400">Qabul darajasi</div></div><TrendingUp className="w-8 h-8 text-orange-500 opacity-50" /></div>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="w-5 h-5" />Kategoriyalar</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {Object.entries(filteredJobs.reduce((acc: Record<string, number>, job) => { acc[job.category] = (acc[job.category] || 0) + 1; return acc; }, {})).slice(0, 5).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center"><span className="text-sm">{category}</span><Badge variant="secondary">{count}</Badge></div>
            ))}
            {filteredJobs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Malumot yoq</p>}
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><PieChart className="w-5 h-5" />Viloyatlar</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {Object.entries(filteredUsers.reduce((acc: Record<string, number>, user) => { acc[user.region || 'Nomalum'] = (acc[user.region || 'Nomalum'] || 0) + 1; return acc; }, {})).slice(0, 5).map(([region, count]) => (
              <div key={region} className="flex justify-between items-center"><span className="text-sm">{region}</span><Badge variant="secondary">{count}</Badge></div>
            ))}
            {filteredUsers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Malumot yoq</p>}
          </div>
        </CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="w-5 h-5" />Songgi faoliyat</CardTitle></CardHeader><CardContent>
        <div className="space-y-4">
          {activityLogs.map(log => (
            <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><span className="font-medium text-sm">{log.user}</span><span className="text-xs text-muted-foreground">{formatTimeAgo(log.timestamp)}</span></div>
                <p className="text-sm text-muted-foreground">{log.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Malumotlarni export qilish</DialogTitle><DialogDescription>Export turi va formatini tanlang</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Malumot turi</Label><Select value={exportType} onValueChange={(v) => setExportType(v as typeof exportType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Barchasi</SelectItem><SelectItem value="users">Foydalanuvchilar</SelectItem><SelectItem value="jobs">Ishlar</SelectItem><SelectItem value="applications">Arizalar</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Format</Label><Select value={exportFormat} onValueChange={(v) => setExportFormat(v as typeof exportFormat)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="csv">CSV (Excel)</SelectItem><SelectItem value="json">JSON</SelectItem><SelectItem value="txt">TXT</SelectItem></SelectContent></Select></div>
            <div className="p-3 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">{exportType === 'all' ? 'Barcha' : exportType === 'users' ? filteredUsers.length + ' foydalanuvchi' : exportType === 'jobs' ? filteredJobs.length + ' ish' : filteredApplications.length + ' ariza'} export qilinadi</p></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setExportModalOpen(false)}>Bekor</Button><Button onClick={exportData}><Download className="w-4 h-4 mr-2" />Export</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
