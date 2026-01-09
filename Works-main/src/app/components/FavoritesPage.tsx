import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, MapPin, Clock, Briefcase, Trash2, ArrowLeft } from 'lucide-react';
import type { Job } from '../../lib/types';

interface FavoritesPageProps {
  jobs: Job[];
  onBack: () => void;
  onJobClick?: (job: Job) => void;
  onApply?: (job: Job) => void;
}

export function FavoritesPage({ jobs, onBack, onJobClick, onApply }: FavoritesPageProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteJobs, setFavoriteJobs] = useState<Job[]>([]);

  useEffect(() => {
    // LocalStorage'dan sevimlilarni yuklash
    const ids = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
    setFavoriteIds(ids);
  }, []);

  useEffect(() => {
    // Sevimli ishlarni filterlash
    const filtered = jobs.filter(job => favoriteIds.includes(job.id));
    setFavoriteJobs(filtered);
  }, [favoriteIds, jobs]);

  useEffect(() => {
    // Custom event listener
    const handleFavoritesUpdated = () => {
      const ids = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
      setFavoriteIds(ids);
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
  }, []);

  const removeFavorite = (jobId: string) => {
    const newIds = favoriteIds.filter(id => id !== jobId);
    localStorage.setItem('favoriteJobs', JSON.stringify(newIds));
    setFavoriteIds(newIds);
  };

  const clearAllFavorites = () => {
    localStorage.setItem('favoriteJobs', JSON.stringify([]));
    setFavoriteIds([]);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              Sevimli ishlar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {favoriteJobs.length} ta ish saqlangan
            </p>
          </div>
        </div>
        {favoriteJobs.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFavorites} className="text-red-500 hover:text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Barchasini o'chirish
          </Button>
        )}
      </div>

      {/* Empty state */}
      {favoriteJobs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Sevimli ishlar yo'q</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ishlarni ko'rib chiqing va yoqqanlarini saqlang
            </p>
            <Button onClick={onBack}>Ishlarni ko'rish</Button>
          </CardContent>
        </Card>
      )}

      {/* Favorites list */}
      <div className="grid gap-4">
        {favoriteJobs.map(job => (
          <Card 
            key={job.id} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onJobClick?.(job)}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Job image */}
                {job.imageUrl && (
                  <div className="w-full md:w-24 h-32 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={job.imageUrl} 
                      alt={job.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{job.employerName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.isVip && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          VIP
                        </Badge>
                      )}
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                        {job.status === 'active' ? 'Faol' : 'Yopilgan'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.employerRegion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                  
                  {job.salary && (
                    <p className="text-lg font-semibold text-primary mt-2">
                      {job.salary.toLocaleString()} so'm
                      {job.salaryType && <span className="text-sm font-normal text-muted-foreground">/{job.salaryType === 'daily' ? 'kunlik' : job.salaryType === 'monthly' ? 'oylik' : job.salaryType}</span>}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex md:flex-col items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(job.id);
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Heart className="w-5 h-5 fill-red-500" />
                  </Button>
                  {job.status === 'active' && onApply && (
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply(job);
                      }}
                    >
                      Ariza
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
