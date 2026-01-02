import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, Trash2, Eye, Calendar, MapPin, DollarSign, Star, CheckCircle, XCircle, CalendarPlus, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { JobCard } from '../JobCard';
import type { Job } from '../../../lib/types';
import type { JobData } from '../JobPostForm';

interface JobsManagementProps {
  jobs: Job[];
  onDeleteJob: (jobId: string) => void;
  onToggleFeatured?: (jobId: string) => void;
  onApproveJob?: (jobId: string) => void;
  onRejectJob?: (jobId: string, reason: string) => void;
  onExtendDeadline?: (jobId: string, newDeadline: string) => void;
}

function jobToJobData(job: Job): JobData {
  return {
    id: job.id, employerName: job.employerName, employerRegion: job.employerRegion, employerPhone: job.employerPhone,
    title: job.title, description: job.description, startDate: job.startDate || job.createdAt,
    durationType: (job.durationType as JobData['durationType']) || 'few-days',
    status: (job.status as JobData['status']) || 'active', 
    approvalStatus: ((job as any).approvalStatus as JobData['approvalStatus']) || 'approved',
    imageUrl: job.imageUrl, salary: job.salary,
    paymentType: job.paymentType as JobData['paymentType'], featured: job.featured || job.isVip,
    createdAt: job.createdAt, deadline: job.deadline, price: job.price,
  };
}

export function JobsManagement({ jobs, onDeleteJob, onToggleFeatured, onApproveJob, onRejectJob, onExtendDeadline }: JobsManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired' | 'featured'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const now = new Date();
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (job.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || (job.employerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = job.deadline ? new Date(job.deadline) > now : job.status === 'active';
    const isPending = (job as any).approvalStatus === 'pending' || job.status === 'draft';
    const isRejected = (job as any).approvalStatus === 'rejected';
    const isFeatured = job.featured || job.isVip;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && isActive && !isPending && !isRejected) || (statusFilter === 'pending' && isPending) || (statusFilter === 'expired' && !isActive) || (statusFilter === 'featured' && isFeatured);
    return matchesSearch && matchesStatus;
  });

  const activeJobsCount = jobs.filter(j => (j.deadline ? new Date(j.deadline) > now : j.status === 'active') && (j as any).approvalStatus !== 'pending' && (j as any).approvalStatus !== 'rejected' && j.status !== 'draft').length;
  const pendingJobsCount = jobs.filter(j => (j as any).approvalStatus === 'pending' || j.status === 'draft').length;
  const expiredJobsCount = jobs.filter(j => j.deadline ? new Date(j.deadline) < now : j.status === 'closed').length;
  const featuredJobsCount = jobs.filter(j => j.featured || j.isVip).length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0);
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);

  const handleRejectJob = () => {
    if (selectedJob && onRejectJob && rejectReason.trim()) { onRejectJob(selectedJob.id, rejectReason); setRejectModalOpen(false); setSelectedJob(null); setRejectReason(''); }
  };
  const handleExtendDeadline = () => {
    if (selectedJob && onExtendDeadline && newDeadline) { onExtendDeadline(selectedJob.id, newDeadline); setExtendModalOpen(false); setSelectedJob(null); setNewDeadline(''); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ishlar boshqaruvi</h1>
        <p className="text-sm text-muted-foreground mt-1">Barcha ishlarni korish va moderatsiya qilish</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"><CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{jobs.length}</div><div className="text-xs text-blue-600 dark:text-blue-400">Jami</div></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"><CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-green-700 dark:text-green-300">{activeJobsCount}</div><div className="text-xs text-green-600 dark:text-green-400">Aktiv</div></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900"><CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingJobsCount}</div><div className="text-xs text-yellow-600 dark:text-yellow-400">Kutilmoqda</div></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"><CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{featuredJobsCount}</div><div className="text-xs text-purple-600 dark:text-purple-400">VIP</div></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"><CardContent className="pt-4 pb-4"><div className="text-center"><div className="text-2xl font-bold text-red-700 dark:text-red-300">{expiredJobsCount}</div><div className="text-xs text-red-600 dark:text-red-400">Tugagan</div></div></CardContent></Card>
      </div>

      <div className="flex justify-end"><Button variant="outline" onClick={() => setStatsModalOpen(true)}><BarChart3 className="w-4 h-4 mr-2" />Statistika</Button></div>

      <Card><CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>Barchasi ({jobs.length})</Button>
            <Button variant={statusFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('active')}>Aktiv ({activeJobsCount})</Button>
            <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>Kutilmoqda ({pendingJobsCount})</Button>
            <Button variant={statusFilter === 'featured' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('featured')}>VIP ({featuredJobsCount})</Button>
            <Button variant={statusFilter === 'expired' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('expired')}>Tugagan ({expiredJobsCount})</Button>
          </div>
        </div>
      </CardContent></Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.length === 0 ? (<Card className="sm:col-span-2 lg:col-span-3"><CardContent className="py-12 text-center text-muted-foreground">Ishlar topilmadi</CardContent></Card>) : filteredJobs.map((job) => {
          const isExpired = job.deadline ? new Date(job.deadline) < now : job.status === 'closed';
          const isPending = (job as any).approvalStatus === 'pending' || job.status === 'draft';
          return (
            <Card key={job.id} className={`${isExpired ? 'opacity-60' : ''} ${isPending ? 'border-yellow-500 border-2' : ''} ${job.featured ? 'border-purple-500 border-2' : ''}`}>
              <CardContent className="pt-6 space-y-4">
                {job.imageUrl && <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted"><img src={job.imageUrl} alt={job.title} className="w-full h-full object-cover" /></div>}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-2">{job.title}</h3>
                    <div className="flex gap-1">{isPending && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Kutilmoqda</Badge>}{isExpired && <Badge variant="secondary">Tugagan</Badge>}{job.featured && <Badge className="bg-purple-500"><Star className="w-3 h-3 mr-1" />VIP</Badge>}</div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /><span>{job.employerRegion}</span></div>
                    <div className="flex items-center gap-2"><DollarSign className="w-3 h-3" /><span className="font-medium text-primary">{job.price || job.salary || 'Kelishiladi'}</span></div>
                    {job.deadline && <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /><span>Muddat: {new Date(job.deadline).toLocaleDateString('uz-UZ')}</span></div>}
                    <div className="flex items-center gap-4"><span><Eye className="w-3 h-3 inline mr-1" />{job.viewCount || 0}</span><span>{job.applicationCount || 0} ariza</span></div>
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground border-t">Ish beruvchi: <span className="font-medium">{job.employerName}</span></div>
                </div>
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)} title="Korish"><Eye className="w-4 h-4" /></Button>
                  {isPending && onApproveJob && <Button variant="outline" size="sm" onClick={() => onApproveJob(job.id)} className="text-green-600 border-green-600 hover:bg-green-50" title="Tasdiqlash"><CheckCircle className="w-4 h-4" /></Button>}
                  {isPending && onRejectJob && <Button variant="outline" size="sm" onClick={() => { setSelectedJob(job); setRejectModalOpen(true); }} className="text-red-600 border-red-600 hover:bg-red-50" title="Rad etish"><XCircle className="w-4 h-4" /></Button>}
                  {onExtendDeadline && !isPending && <Button variant="outline" size="sm" onClick={() => { setSelectedJob(job); setNewDeadline(''); setExtendModalOpen(true); }} title="Muddatni uzaytirish"><CalendarPlus className="w-4 h-4" /></Button>}
                  {onToggleFeatured && <Button variant={job.featured ? "default" : "outline"} size="sm" className={job.featured ? "bg-purple-500 hover:bg-purple-600 text-white" : ""} onClick={() => onToggleFeatured(job.id)} title={job.featured ? "VIP dan olish" : "VIP qilish"}><Star className={`w-4 h-4 ${job.featured ? 'fill-white' : ''}`} /></Button>}
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => { if (confirm(`"${job.title}" ochirish?`)) onDeleteJob(job.id); }} title="Ochirish"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredJobs.length > 0 && <Card><CardContent className="py-4"><p className="text-sm text-muted-foreground text-center">Jami {filteredJobs.length} ta ish</p></CardContent></Card>}

      {selectedJob && !rejectModalOpen && !extendModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4"><h2 className="text-2xl font-bold">Ish batafsil</h2><Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>X</Button></div>
              <JobCard job={jobToJobData(selectedJob)} />
              <div className="mt-6 flex gap-2 flex-wrap">
                {selectedJob.status === 'draft' && onApproveJob && <Button onClick={() => { onApproveJob(selectedJob.id); setSelectedJob(null); }} className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Tasdiqlash</Button>}
                <Button variant="destructive" onClick={() => { if (confirm(`"${selectedJob.title}" ochirish?`)) { onDeleteJob(selectedJob.id); setSelectedJob(null); } }}><Trash2 className="w-4 h-4 mr-2" />Ochirish</Button>
                <Button variant="outline" onClick={() => setSelectedJob(null)}>Yopish</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Rad etish</DialogTitle><DialogDescription>"{selectedJob?.title}" rad etish sababini kiriting</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="space-y-2"><Label>Sabab</Label><textarea className="w-full min-h-[100px] p-3 border rounded-md" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Sabab..." /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setRejectModalOpen(false)}>Bekor</Button><Button variant="destructive" onClick={handleRejectJob} disabled={!rejectReason.trim()}><XCircle className="w-4 h-4 mr-2" />Rad etish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Muddatni uzaytirish</DialogTitle><DialogDescription>"{selectedJob?.title}" uchun yangi muddat</DialogDescription></DialogHeader>
          <div className="space-y-4"><div className="space-y-2"><Label>Yangi muddat</Label><Input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} /></div>{selectedJob?.deadline && <p className="text-sm text-muted-foreground">Hozirgi: {new Date(selectedJob.deadline).toLocaleDateString('uz-UZ')}</p>}</div>
          <DialogFooter><Button variant="outline" onClick={() => setExtendModalOpen(false)}>Bekor</Button><Button onClick={handleExtendDeadline} disabled={!newDeadline}><CalendarPlus className="w-4 h-4 mr-2" />Uzaytirish</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statsModalOpen} onOpenChange={setStatsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Ish statistikasi</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="pt-4"><div className="text-center"><div className="text-3xl font-bold text-primary">{jobs.length}</div><div className="text-sm text-muted-foreground">Jami ishlar</div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="text-center"><div className="text-3xl font-bold text-green-600">{activeJobsCount}</div><div className="text-sm text-muted-foreground">Aktiv</div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="text-center"><div className="text-3xl font-bold text-blue-600">{totalViews}</div><div className="text-sm text-muted-foreground">Korishlar</div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="text-center"><div className="text-3xl font-bold text-purple-600">{totalApplications}</div><div className="text-sm text-muted-foreground">Arizalar</div></div></CardContent></Card>
            </div>
            <div className="border-t pt-4"><h4 className="font-semibold mb-2">Kategoriyalar</h4><div className="space-y-2">{Object.entries(jobs.reduce((acc: Record<string, number>, job) => { acc[job.category] = (acc[job.category] || 0) + 1; return acc; }, {})).map(([cat, count]) => (<div key={cat} className="flex justify-between items-center"><span className="text-sm">{cat}</span><Badge variant="secondary">{count}</Badge></div>))}</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setStatsModalOpen(false)}>Yopish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
