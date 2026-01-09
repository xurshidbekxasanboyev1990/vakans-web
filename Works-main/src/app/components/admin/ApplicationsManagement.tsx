import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, CheckCircle, XCircle, Eye, User, Briefcase, Calendar, Clock, BarChart3, FileText, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import type { Application } from '../../../lib/types';

interface ApplicationsManagementProps {
  applications: Application[];
  onApprove?: (applicationId: string) => void;
  onReject?: (applicationId: string, reason: string) => void;
}

export function ApplicationsManagement({ applications, onApprove, onReject }: ApplicationsManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.workerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  const handleReject = () => {
    if (selectedApp && onReject && rejectReason.trim()) {
      onReject(selectedApp.id, rejectReason);
      setRejectModalOpen(false);
      setSelectedApp(null);
      setRejectReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Kutilmoqda</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Qabul qilindi</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rad etildi</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Arizalar boshqaruvi</h1>
        <p className="text-sm text-muted-foreground mt-1">Barcha arizalarni ko'rish va boshqarish</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{applications.length}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Jami arizalar</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingCount}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Kutilmoqda</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{acceptedCount}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Qabul qilindi</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{rejectedCount}</div>
              <div className="text-xs text-red-600 dark:text-red-400">Rad etildi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setStatsModalOpen(true)}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Statistika
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Ish nomi yoki ishchi ismi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>Barchasi ({applications.length})</Button>
              <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>Kutilmoqda ({pendingCount})</Button>
              <Button variant={statusFilter === 'accepted' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('accepted')}>Qabul ({acceptedCount})</Button>
              <Button variant={statusFilter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('rejected')}>Rad ({rejectedCount})</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Arizalar topilmadi</CardContent>
          </Card>
        ) : filteredApplications.map((app) => (
          <Card key={app.id} className={app.status === 'pending' ? 'border-yellow-500 border-l-4' : app.status === 'accepted' ? 'border-green-500 border-l-4' : app.status === 'rejected' ? 'border-red-500 border-l-4' : ''}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{app.jobTitle}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Ishchi: <span className="font-medium text-foreground">{app.workerName}</span></span>
                    </div>
                    {app.workerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{app.workerPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ariza: {new Date(app.createdAt).toLocaleDateString('uz-UZ')}</span>
                    </div>
                    {app.message && (
                      <div className="flex items-center gap-2 col-span-2">
                        <FileText className="w-4 h-4" />
                        <span className="line-clamp-1">{app.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)} title="Ko'rish">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {app.status === 'pending' && onApprove && (
                    <Button variant="outline" size="sm" onClick={() => onApprove(app.id)} className="text-green-600 border-green-600 hover:bg-green-50" title="Qabul qilish">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {app.status === 'pending' && onReject && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedApp(app); setRejectModalOpen(true); }} className="text-red-600 border-red-600 hover:bg-red-50" title="Rad etish">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">Jami {filteredApplications.length} ta ariza</p>
          </CardContent>
        </Card>
      )}

      {/* View Application Modal */}
      {selectedApp && !rejectModalOpen && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ariza ma'lumotlari</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Holati:</span>
                {getStatusBadge(selectedApp.status)}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedApp.jobTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApp.workerName}</span>
                </div>
                {selectedApp.workerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedApp.workerPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(selectedApp.createdAt).toLocaleDateString('uz-UZ')}</span>
                </div>
                {selectedApp.message && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Xabar:</span>
                    </div>
                    <p className="text-sm p-3 bg-muted rounded-md">{selectedApp.message}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              {selectedApp.status === 'pending' && onApprove && (
                <Button onClick={() => { onApprove(selectedApp.id); setSelectedApp(null); }} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />Qabul qilish
                </Button>
              )}
              {selectedApp.status === 'pending' && onReject && (
                <Button variant="destructive" onClick={() => setRejectModalOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2" />Rad etish
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Yopish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Arizani rad etish</DialogTitle>
            <DialogDescription>"{selectedApp?.workerName}" ning arizasini rad etish sababini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rad etish sababi</Label>
              <textarea className="w-full min-h-[100px] p-3 border rounded-md" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Sabab..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Bekor</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              <XCircle className="w-4 h-4 mr-2" />Rad etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Modal */}
      <Dialog open={statsModalOpen} onOpenChange={setStatsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ariza statistikasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{applications.length}</div>
                    <div className="text-sm text-muted-foreground">Jami arizalar</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
                    <div className="text-sm text-muted-foreground">Kutilmoqda</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{acceptedCount}</div>
                    <div className="text-sm text-muted-foreground">Qabul qilindi</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
                    <div className="text-sm text-muted-foreground">Rad etildi</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Qabul qilish darajasi</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-600 h-4 rounded-full" style={{ width: `${applications.length > 0 ? (acceptedCount / applications.length * 100) : 0}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{applications.length > 0 ? Math.round(acceptedCount / applications.length * 100) : 0}% arizalar qabul qilindi</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatsModalOpen(false)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
