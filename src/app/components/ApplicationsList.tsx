import { Check, X, User, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Application, ApplicationStatusLabels, ApplicationStatusColors } from './ApplicationTypes';

interface ApplicationsListProps {
  applications: Application[];
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onOpenChat?: (jobId: string, workerName: string, workerPhone: string) => void;
}

export function ApplicationsList({ applications, onAccept, onReject, onOpenChat }: ApplicationsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Hali arizalar yo'q</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {applications.map((application) => (
        <div 
          key={application.id} 
          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{application.workerName}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{application.workerRegion}</span>
                  </p>
                </div>
              </div>
              <Badge className={`${ApplicationStatusColors[application.status]} text-xs px-2 py-0.5 flex-shrink-0`}>
                {ApplicationStatusLabels[application.status]}
              </Badge>
            </div>

            {/* Message */}
            <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-foreground break-words">{application.message}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(application.createdAt)}
              </p>

              <div className="flex gap-2 flex-wrap">
                {/* Chat tugmasi */}
                {onOpenChat && application.workerPhone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChat(application.jobId, application.workerName, application.workerPhone || '')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Xabar
                  </Button>
                )}

                {application.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(application.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Rad etish
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAccept(application.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Qabul qilish
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
