import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { StarRating } from './StarRating';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import type { Rating, UserRatingSummary } from '../../lib/types';

interface UserRatingsProps {
  ratings: Rating[];
  summary?: UserRatingSummary;
  showTitle?: boolean;
}

export function UserRatings({ ratings, summary, showTitle = true }: UserRatingsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const ratingColors = {
    5: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    4: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
    3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    2: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    1: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            Baholar
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        {/* Summary */}
        {summary && (
          <div className="flex items-start gap-6 mb-6 pb-6 border-b">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {summary.averageRating.toFixed(1)}
              </div>
              <StarRating rating={summary.averageRating} size="sm" className="justify-center mt-1" />
              <p className="text-sm text-muted-foreground mt-1">
                {summary.totalRatings} ta baho
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary.ratingDistribution[star as keyof typeof summary.ratingDistribution];
                const percentage = summary.totalRatings > 0 
                  ? (count / summary.totalRatings) * 100 
                  : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ratings list */}
        {ratings.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Hali baholar yo'q</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map(rating => (
              <div key={rating.id} className="pb-4 border-b last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{rating.fromUserName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={rating.rating} size="sm" />
                        <Badge className={ratingColors[rating.rating as keyof typeof ratingColors]}>
                          {rating.rating}/5
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(rating.createdAt)}
                  </div>
                </div>
                
                {rating.jobTitle && (
                  <p className="text-xs text-muted-foreground mt-2 ml-13">
                    Ish: {rating.jobTitle}
                  </p>
                )}
                
                {rating.comment && (
                  <div className="mt-2 ml-13 p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{rating.comment}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
