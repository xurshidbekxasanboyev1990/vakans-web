import { useState } from 'react';
import { X, Check, User, MapPin, Clock, MessageCircle, Briefcase, Users, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Application, ApplicationStatusLabels, ApplicationStatusColors } from './ApplicationTypes';
import { JobData } from './JobPostForm';

interface AllApplicationsModalProps {
  jobs: JobData[];
  applications: Application[];
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onOpenChat?: (jobId: string, workerName: string, workerPhone: string) => void;
  onClose: () => void;
}

export function AllApplicationsModal({ 
  jobs, 
  applications, 
  onAccept, 
  onReject, 
  onOpenChat, 
  onClose 
}: AllApplicationsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (app.workerName || '').toLowerCase().includes(q) ||
      (app.message || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.jobId === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Group applications by job
  const groupedByJob = jobs.reduce((acc, job) => {
    const jobApps = filteredApplications.filter(app => app.jobId === job.id);
    if (jobApps.length > 0) {
      acc[job.id] = { job, applications: jobApps };
    }
    return acc;
  }, {} as Record<string, { job: JobData; applications: Application[] }>);

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Barcha Arizalar
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {applications.length} ta ariza, {jobs.length} ta ish
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="rounded-full w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {pendingCount} kutilmoqda
            </Badge>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {acceptedCount} qabul qilingan
            </Badge>
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {rejectedCount} rad etilgan
            </Badge>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Ism yoki xabar bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="h-10 w-full sm:w-40 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                <SelectValue placeholder="Holati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="accepted">Qabul qilingan</SelectItem>
                <SelectItem value="rejected">Rad etilgan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="h-10 w-full sm:w-48 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                <SelectValue placeholder="Ish bo'yicha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha ishlar</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Arizalar topilmadi
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {applications.length === 0 
                  ? 'Hali hech kim ariza yubormagan' 
                  : 'Filtrlarni o\'zgartiring'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByJob).map(([jobId, { job, applications: jobApps }]) => (
                <div key={jobId} className="space-y-3">
                  {/* Job Header */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.employerRegion}
                        <span className="mx-1">•</span>
                        {jobApps.length} ta ariza
                      </p>
                    </div>
                    <Badge className={`
                      ${job.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        job.status === 'completed' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                    `}>
                      {job.status === 'active' ? 'Faol' : job.status === 'completed' ? 'Yakunlangan' : 'To\'xtatilgan'}
                    </Badge>
                  </div>

                  {/* Applications for this job */}
                  <div className="space-y-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                    {jobApps.map((application) => (
                      <div 
                        key={application.id} 
                        className={`
                          relative p-4 rounded-xl border-2 transition-all duration-200
                          ${application.status === 'pending' 
                            ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' 
                            : application.status === 'accepted'
                              ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                          }
                        `}
                      >
                        {/* Applicant Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {application.workerName}
                              </h4>
                              <Badge className={`${ApplicationStatusColors[application.status]} text-xs`}>
                                {ApplicationStatusLabels[application.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {application.workerRegion}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(application.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                            {application.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {onOpenChat && application.workerPhone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenChat(application.jobId, application.workerName, application.workerPhone || '')}
                              className="border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <MessageCircle className="w-4 h-4 mr-1.5" />
                              Xabar
                            </Button>
                          )}

                          {application.status === 'pending' && (
                            <div className="flex gap-2 ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReject(application.id)}
                                className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="w-4 h-4 mr-1.5" />
                                Rad
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => onAccept(application.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                              >
                                <Check className="w-4 h-4 mr-1.5" />
                                Qabul
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
