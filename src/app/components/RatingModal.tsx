import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { StarRating } from './StarRating';
import { User, Briefcase } from 'lucide-react';
import type { Rating } from '../../lib/types';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    id: string;
    name: string;
    userType: 'worker' | 'employer';
  };
  jobId?: string;
  jobTitle?: string;
  fromUser: {
    id: string;
    name: string;
  };
  onSubmit: (rating: Omit<Rating, 'id' | 'createdAt'>) => void;
  existingRating?: Rating;
}

export function RatingModal({
  open,
  onOpenChange,
  targetUser,
  jobId,
  jobTitle,
  fromUser,
  onSubmit,
  existingRating
}: RatingModalProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        fromUserId: fromUser.id,
        fromUserName: fromUser.name,
        toUserId: targetUser.id,
        toUserName: targetUser.name,
        toUserType: targetUser.userType,
        jobId,
        jobTitle,
        rating,
        comment: comment.trim() || undefined
      });
      onOpenChange(false);
      setRating(0);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Juda yomon', 'Yomon', 'O\'rtacha', 'Yaxshi', 'A\'lo'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {targetUser.userType === 'worker' ? (
              <User className="w-5 h-5 text-blue-500" />
            ) : (
              <Briefcase className="w-5 h-5 text-green-500" />
            )}
            {targetUser.userType === 'worker' ? 'Ishchini baholash' : 'Ish beruvchini baholash'}
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{targetUser.name}</span>
            {jobTitle && (
              <span className="block text-xs mt-1">
                Ish: {jobTitle}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star rating */}
          <div className="text-center space-y-3">
            <Label className="text-base">Baho bering</Label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                size="lg"
                editable
                onChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium text-primary">
                {ratingLabels[rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Izoh (ixtiyoriy)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bu yerda o'z fikringizni yozing..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Rating preview */}
          {rating > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <StarRating rating={rating} size="sm" />
                <span className="text-sm font-medium">{rating}/5</span>
              </div>
              {comment && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  "{comment}"
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Yuborilmoqda...' : existingRating ? 'Yangilash' : 'Baholash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
