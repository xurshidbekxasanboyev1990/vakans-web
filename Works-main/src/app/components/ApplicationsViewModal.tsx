import { X, Check, User, MapPin, Clock, MessageCircle, Briefcase, Users, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Application, ApplicationStatusLabels, ApplicationStatusColors } from './ApplicationTypes';
import { JobData } from './JobPostForm';

interface ApplicationsViewModalProps {
  job: JobData;
  applications: Application[];
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onOpenChat?: (jobId: string, workerName: string, workerPhone: string) => void;
  onClose: () => void;
}

export function ApplicationsViewModal({ 
  job, 
  applications, 
  onAccept, 
  onReject, 
  onOpenChat, 
  onClose 
}: ApplicationsViewModalProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {job.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.employerRegion}
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-3 flex-wrap mt-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {applications.length} ta ariza
                  </span>
                </div>
                {pendingCount > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {pendingCount} yangi
                  </Badge>
                )}
                {acceptedCount > 0 && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {acceptedCount} qabul qilingan
                  </Badge>
                )}
                {rejectedCount > 0 && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {rejectedCount} rad etilgan
                  </Badge>
                )}
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
        </div>

        {/* Applications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Hali arizalar yo'q
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bu ishga hali hech kim ariza yubormagan
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
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
                  {/* Applicant Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {application.workerName}
                        </h4>
                        <Badge className={`${ApplicationStatusColors[application.status]} text-xs`}>
                          {ApplicationStatusLabels[application.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {application.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Chat Button */}
                    {onOpenChat && application.workerPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChat(application.jobId, application.workerName, application.workerPhone || '')}
                        className="border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        Xabar yozish
                      </Button>
                    )}

                    {/* Accept/Reject Buttons */}
                    {application.status === 'pending' && (
                      <div className="flex gap-2 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReject(application.id)}
                          className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          Rad etish
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAccept(application.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          Qabul qilish
                        </Button>
                      </div>
                    )}

                    {/* Already processed status */}
                    {application.status === 'accepted' && (
                      <div className="ml-auto flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        Qabul qilingan
                      </div>
                    )}
                    {application.status === 'rejected' && (
                      <div className="ml-auto flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <X className="w-4 h-4" />
                        Rad etilgan
                      </div>
                    )}
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
