import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from './ui/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  editable = false,
  onChange,
  showValue = false,
  showCount = false,
  count = 0,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value: number) => {
    if (editable && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const value = i + 1;
          const isFilled = (editable ? hoverRating || rating : rating) >= value;
          const isHalf = !isFilled && (editable ? hoverRating || rating : rating) >= value - 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={!editable}
              title={`${value} yulduz`}
              className={cn(
                'transition-all duration-150',
                editable && 'cursor-pointer hover:scale-110',
                !editable && 'cursor-default'
              )}
              onMouseEnter={() => editable && setHoverRating(value)}
              onMouseLeave={() => editable && setHoverRating(0)}
              onClick={() => handleClick(value)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isHalf
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'fill-transparent text-gray-300 dark:text-gray-600'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="text-sm text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}
