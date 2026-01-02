import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Send, Mail, Check, X, Clock, Briefcase, User, Calendar, DollarSign } from 'lucide-react';
import type { JobOffer, User as UserType, Job } from '../../lib/types';

interface SendOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: UserType;
  jobs: Job[];
  employer: {
    id: string;
    name: string;
  };
  onSendOffer: (offer: Omit<JobOffer, 'id' | 'createdAt' | 'status'>) => void;
}

export function SendOfferModal({
  open,
  onOpenChange,
  worker,
  jobs,
  employer,
  onSendOffer
}: SendOfferModalProps) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [message, setMessage] = useState('');
  const [salary, setSalary] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleSend = async () => {
    if (!selectedJobId || !message.trim()) return;

    setIsSending(true);
    try {
      await onSendOffer({
        jobId: selectedJobId,
        jobTitle: selectedJob?.title || '',
        employerId: employer.id,
        employerName: employer.name,
        workerId: worker.id,
        workerName: `${worker.firstName} ${worker.lastName}`,
        message: message.trim(),
        salary: salary ? parseInt(salary.replace(/\D/g, '')) : undefined
      });
      onOpenChange(false);
      setSelectedJobId('');
      setMessage('');
      setSalary('');
    } finally {
      setIsSending(false);
    }
  };

  const defaultMessage = selectedJob 
    ? `Assalomu alaykum, ${worker.firstName}!\n\nSizning profilingizni ko'rib, "${selectedJob.title}" ishi uchun taklif qilmoqchimiz. Qiziqsangiz, aloqaga chiqing.`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Ish taklifi yuborish
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{worker.firstName} {worker.lastName}</span>
            {worker.region && <span> • {worker.region}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job selection */}
          <div className="space-y-2">
            <Label>Ish tanlang *</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {jobs.filter(j => j.status === 'active').map(job => (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    if (!message) setMessage(defaultMessage);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{job.title}</span>
                    {job.isVip && <Badge className="text-xs">VIP</Badge>}
                  </div>
                  {job.salary && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {job.salary.toLocaleString()} so'm
                    </p>
                  )}
                </div>
              ))}
              {jobs.filter(j => j.status === 'active').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Faol ishlar yo'q. Avval ish e'lon qiling.
                </p>
              )}
            </div>
          </div>

          {/* Salary offer */}
          <div className="space-y-2">
            <Label htmlFor="salary">Taklif qilinadigan ish haqi (ixtiyoriy)</Label>
            <Input
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Masalan: 5000000"
              type="number"
            />
            <p className="text-xs text-muted-foreground">
              Ish e'lonidagi narxdan farqli bo'lsa kiriting
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Xabar *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Taklifingiz haqida yozing..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>

          {/* Preview */}
          {selectedJob && message && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Taklif:</p>
              <p className="text-muted-foreground line-clamp-3">{message}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!selectedJobId || !message.trim() || isSending}
          >
            {isSending ? 'Yuborilmoqda...' : 'Yuborish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========== JOB OFFERS LIST COMPONENT ==========

interface JobOffersListProps {
  offers: JobOffer[];
  userType: 'worker' | 'employer';
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
}

export function JobOffersList({ offers, userType, onAccept, onReject }: JobOffersListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusBadge = (status: JobOffer['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Kutilmoqda</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-300"><Check className="w-3 h-3 mr-1" />Qabul qilindi</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><X className="w-3 h-3 mr-1" />Rad etildi</Badge>;
    }
  };

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">
            {userType === 'worker' ? 'Hali takliflar yo\'q' : 'Hali taklif yubormagansiz'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5" />
          {userType === 'worker' ? 'Kelgan takliflar' : 'Yuborilgan takliflar'}
          <Badge variant="secondary">{offers.filter(o => o.status === 'pending').length} ta yangi</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {offers.map(offer => (
            <div key={offer.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-medium">{offer.jobTitle}</span>
                    {statusBadge(offer.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {userType === 'worker' ? offer.employerName : offer.workerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(offer.createdAt)}
                    </span>
                    {offer.salary && (
                      <span className="flex items-center gap-1 text-primary">
                        <DollarSign className="w-3 h-3" />
                        {offer.salary.toLocaleString()} so'm
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground">{offer.message}</p>
                </div>
              </div>
              
              {/* Actions for worker */}
              {userType === 'worker' && offer.status === 'pending' && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onReject?.(offer.id)}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rad etish
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onAccept?.(offer.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Qabul qilish
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
