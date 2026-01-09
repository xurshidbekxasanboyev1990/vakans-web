import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Briefcase, Phone, Send, Banknote, Star, Eye, Users, Sparkles, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { JobData, JobStatus, DurationType, PaymentType, GenderPreference } from './JobPostForm';
import { ChatButton } from './ChatButton';
import { Button } from './ui/button';
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface JobCardProps {
  job: JobData;
  showChatButton?: boolean;
  showApplyButton?: boolean;
  showStats?: boolean; // For employer view
  onOpenChat?: (jobId: string, employerName: string, employerPhone: string) => void;
  onApply?: (jobId: string, jobTitle: string, employerName: string) => void;
}

export function JobCard({ job, showChatButton, showApplyButton, showStats, onOpenChat, onApply }: JobCardProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<{likes: number, dislikes: number, userReaction: 'like' | 'dislike' | null}>({
    likes: job.likesCount || 0,
    dislikes: job.dislikesCount || 0,
    userReaction: null
  });
  const [viewCount, setViewCount] = useState<number>(job.viewsCount || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Track view on component mount
  useEffect(() => {
    let isMounted = true;
    
    const trackView = async () => {
      // Track view only once per session per job
      const viewedJobs = JSON.parse(sessionStorage.getItem('viewedJobs') || '[]');
      if (!viewedJobs.includes(job.id)) {
        viewedJobs.push(job.id);
        sessionStorage.setItem('viewedJobs', JSON.stringify(viewedJobs));
        
        // Track on server
        await apiService.trackJobView(job.id);
        if (isMounted) {
          setViewCount((prev: number) => prev + 1);
        }
      }
    };

    trackView();

    return () => {
      isMounted = false;
    };
  }, [job.id]);

  // Fetch user's reaction on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchReaction = async () => {
      if (!user || user.userType === 'employer') return;
      
      const response = await apiService.getJobReaction(job.id);
      if (response.success && isMounted) {
        setReactions(prev => ({ 
          ...prev, 
          userReaction: response.data?.userReaction || null 
        }));
      }
    };

    fetchReaction();

    return () => {
      isMounted = false;
    };
  }, [job.id, user]);

  const handleReaction = useCallback(async (type: 'like' | 'dislike') => {
    if (!user || user.userType === 'employer' || isLoading) return;

    setIsLoading(true);
    
    // Optimistic update
    const oldReactions = { ...reactions };
    let newLikes = reactions.likes;
    let newDislikes = reactions.dislikes;
    let newUserReaction: 'like' | 'dislike' | null = type;

    if (reactions.userReaction === type) {
      // Remove reaction
      if (type === 'like') newLikes = Math.max(0, newLikes - 1);
      else newDislikes = Math.max(0, newDislikes - 1);
      newUserReaction = null;
    } else {
      // Remove old reaction if exists
      if (reactions.userReaction === 'like') newLikes = Math.max(0, newLikes - 1);
      if (reactions.userReaction === 'dislike') newDislikes = Math.max(0, newDislikes - 1);
      
      // Add new reaction
      if (type === 'like') newLikes++;
      else newDislikes++;
    }

    setReactions({
      likes: newLikes,
      dislikes: newDislikes,
      userReaction: newUserReaction
    });

    // Send to server
    const response = await apiService.reactToJob(job.id, type);
    
    if (!response.success) {
      // Revert on error
      setReactions(oldReactions);
    }

    setIsLoading(false);
  }, [job.id, user, reactions, isLoading]);

  const durationTypeLabels: Record<DurationType, string> = {
    '1-day': '1 kun',
    'few-days': 'Bir necha kun',
    'week': '1 hafta',
    'month': '1 oy',
    'ongoing': 'Doimiy',
  };

  const paymentTypeLabels: Record<PaymentType, string> = {
    hourly: 'soatiga',
    daily: 'kuniga',
    weekly: 'haftasiga',
    monthly: 'oyiga',
    negotiable: 'Kelishuv',
  };

  const genderPreferenceLabels: Record<GenderPreference, string> = {
    male: 'Erkaklar',
    female: 'Ayollar',
    both: 'Barchasi',
  };

  const statusConfig: Record<JobStatus, { label: string; color: string; bg: string }> = {
    active: { label: 'Faol', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
    paused: { label: "To'xtatilgan", color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
    completed: { label: 'Yakunlangan', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500' },
    cancelled: { label: 'Bekor qilingan', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
  };

  const displayStartDate = job.startDate || job.startTime;
  const isFeatured = job.featured || (job as any).isVip;
  const status = statusConfig[job.status];

  // Salary display
  const getSalaryDisplay = () => {
    if (job.paymentType === 'negotiable' || job.salaryNegotiable) {
      return "Kelishiladi";
    }
    if (job.salary) {
      const formatted = job.salary.toLocaleString('uz-UZ');
      if (job.paymentType) {
        return `${formatted} / ${paymentTypeLabels[job.paymentType]}`;
      }
      return `${formatted} so'm`;
    }
    return null;
  };

  const salaryDisplay = getSalaryDisplay();

  return (
    <div className={`group relative h-full ${isFeatured ? 'job-card-vip' : 'job-card'}`}>
      {/* Card Container */}
      <div className={`
        relative h-full flex flex-col overflow-hidden rounded-xl sm:rounded-2xl
        bg-white dark:bg-gray-900
        border border-gray-300 dark:border-gray-700
        shadow-md hover:shadow-xl dark:shadow-gray-900/50
        transition-all duration-300 ease-out
        ${isFeatured ? 'ring-2 ring-amber-400/50 dark:ring-amber-500/50' : ''}
      `}>
        
        {/* VIP Glow Effect */}
        {isFeatured && (
          <div className="absolute -inset-px bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-2xl opacity-20 blur-sm animate-pulse" />
        )}

        {/* Status Indicator Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${status.bg}`} />

        {/* Image Section */}
        {job.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={job.imageUrl}
              alt={job.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            
            {/* Badges on Image */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              {isFeatured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  VIP
                </Badge>
              )}
              <Badge className={`${status.bg} text-white border-0 shadow-md ml-auto`}>
                {status.label}
              </Badge>
            </div>

            {/* Salary Badge on Image */}
            {salaryDisplay && (
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
                  <Banknote className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {salaryDisplay}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-3 sm:p-4">
          {/* Header */}
          <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
            {/* Title */}
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate max-w-[60px] sm:max-w-[80px]">{job.employerRegion}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600 hidden xs:inline">•</span>
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500 flex-shrink-0" />
                <span className="truncate max-w-[60px] sm:max-w-[80px]">{job.employerName}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
            {job.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            {displayStartDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                {formatDate(displayStartDate)}
              </span>
            )}
            {job.durationType && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate max-w-[60px] sm:max-w-none">{durationTypeLabels[job.durationType]}</span>
              </span>
            )}
            {job.genderPreference && job.genderPreference !== 'both' && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium rounded-md bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                {genderPreferenceLabels[job.genderPreference]}
              </span>
            )}
            {(job as any).viewCount > 0 && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                {(job as any).viewCount}
              </span>
            )}
          </div>

          {/* Salary (if no image) */}
          {!job.imageUrl && salaryDisplay && (
            <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-100 dark:border-emerald-900/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/70 font-medium">To'lov</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 truncate">
                  {salaryDisplay}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge (if no image) */}
          {!job.imageUrl && !isFeatured && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status.bg}`} />
                <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
              </div>
              {isFeatured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] border-0">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  VIP
                </Badge>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stats for employers/admins */}
          {showStats && (
            <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-0.5 sm:gap-1 text-gray-600 dark:text-gray-400">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{viewCount}</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-emerald-600 dark:text-emerald-400">
                  <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{reactions.likes}</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-rose-600 dark:text-rose-400">
                  <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{reactions.dislikes}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reactions for workers */}
          {showApplyButton && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2">
              <button
                onClick={() => handleReaction('like')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all text-xs sm:text-sm ${
                  reactions.userReaction === 'like'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${reactions.userReaction === 'like' ? 'fill-current' : ''}`} />
                <span className="font-medium">{reactions.likes}</span>
              </button>
              <button
                onClick={() => handleReaction('dislike')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all text-xs sm:text-sm ${
                  reactions.userReaction === 'dislike'
                    ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                }`}
              >
                <ThumbsDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${reactions.userReaction === 'dislike' ? 'fill-current' : ''}`} />
                <span className="font-medium">{reactions.dislikes}</span>
              </button>
              <div className="flex items-center gap-0.5 sm:gap-1 text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs ml-1 sm:ml-2">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{viewCount}</span>
              </div>
            </div>
          )}

          {/* Contact & Actions */}
          <div className="space-y-1.5 sm:space-y-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800">
            {/* Quick Contact */}
            <div className="flex gap-1.5 sm:gap-2">
              {(job as any).employerPhone && (
                <a 
                  href={`tel:${(job as any).employerPhone}`}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-md sm:rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="truncate">Qo'ng'iroq</span>
                </a>
              )}
              {job.employerTelegram && (
                <a 
                  href={`https://t.me/${job.employerTelegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-md sm:rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
                >
                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="truncate">Telegram</span>
                </a>
              )}
            </div>

            {/* Action Buttons */}
            {showApplyButton && onApply && job.status === 'active' && (
              <Button
                onClick={() => onApply(job.id, job.title, job.employerName)}
                className="w-full h-8 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm group/btn"
              >
                <span>Ariza yuborish</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1.5 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            )}

            {showChatButton && onOpenChat && (job as any).employerPhone && (
              <ChatButton
                jobId={job.id}
                employerName={job.employerName}
                employerPhone={(job as any).employerPhone}
                onOpenChat={onOpenChat}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}