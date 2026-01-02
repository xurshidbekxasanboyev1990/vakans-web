import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Calendar, MapPin, Banknote, Sparkles } from 'lucide-react';
import { JobData, DurationType } from './JobPostForm';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface FeaturedJobsCarouselProps {
  jobs: JobData[];
  onJobClick: (jobId: string) => void;
}

export function FeaturedJobsCarousel({ jobs, onJobClick }: FeaturedJobsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Faqat featured va active joblarni olamiz
  const featuredJobs = jobs.filter(job => job.featured && job.status === 'active');

  const durationTypeLabels: Record<DurationType, string> = {
    '1-day': '1 kun',
    'few-days': 'Bir necha kun',
    'week': '1 hafta',
    'month': '1 oy',
    'ongoing': 'Doimiy',
  };

  // Auto-play carousel
  useEffect(() => {
    if (featuredJobs.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredJobs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredJobs.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredJobs.length) % featuredJobs.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredJobs.length);
  };

  if (featuredJobs.length === 0) {
    return null;
  }

  const currentJob = featuredJobs[currentIndex];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="w-full mb-6 relative" style={{ zIndex: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
          <span className="text-xs font-bold text-white">VIP E'lonlar</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent dark:from-amber-800" />
        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
      </div>

      <Card 
        className="overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 transition-all duration-500 hover:shadow-2xl shadow-xl group rounded-2xl ring-2 ring-amber-400/50"
        onClick={() => onJobClick(currentJob.id)}
      >
        {/* Featured Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce-soft">
            <Star className="w-3 h-3 fill-white" />
            VIP
          </div>
        </div>

        {/* Image */}
        {currentJob.imageUrl && (
          <div className="relative aspect-[21/9] sm:aspect-[21/6] w-full overflow-hidden">
            <img
              src={currentJob.imageUrl}
              alt={currentJob.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="space-y-3">
            {/* Title & Description */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {currentJob.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {currentJob.description}
              </p>
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">{currentJob.employerRegion}</span>
              </div>
              
              {currentJob.startDate && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">{formatDate(currentJob.startDate)}</span>
                </div>
              )}

              {currentJob.durationType && (
                <div className="px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                  {durationTypeLabels[currentJob.durationType]}
                </div>
              )}

              {/* Price */}
              {(currentJob.salary || currentJob.salaryNegotiable) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {currentJob.salaryNegotiable 
                      ? "Kelishuv" 
                      : `${currentJob.salary?.toLocaleString('uz-UZ')} so'm`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-800/50">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                {currentJob.employerName}
              </span>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all h-9 px-4 rounded-full font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onJobClick(currentJob.id);
                }}
              >
                Batafsil →
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {featuredJobs.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl z-20"
              aria-label="Oldingi"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl z-20"
              aria-label="Keyingi"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {featuredJobs.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-amber-500' 
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`${index + 1}-slayd`}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Counter */}
      {featuredJobs.length > 1 && (
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-amber-600">{currentIndex + 1}</span> / {featuredJobs.length}
        </div>
      )}
    </div>
  );
}
