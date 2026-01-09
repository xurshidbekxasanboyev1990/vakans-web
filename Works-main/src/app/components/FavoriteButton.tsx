import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { cn } from './ui/utils';

interface FavoriteButtonProps {
  jobId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
}

export function FavoriteButton({ 
  jobId, 
  className, 
  size = 'icon',
  variant = 'ghost',
  showText = false 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // LocalStorage'dan sevimlilarni yuklash
    const favorites = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
    setIsFavorite(favorites.includes(jobId));
  }, [jobId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const favorites = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
    
    if (isFavorite) {
      // O'chirish
      const newFavorites = favorites.filter((id: string) => id !== jobId);
      localStorage.setItem('favoriteJobs', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Qo'shish
      favorites.push(jobId);
      localStorage.setItem('favoriteJobs', JSON.stringify(favorites));
      setIsFavorite(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    // Custom event dispatch for other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { jobId, isFavorite: !isFavorite } }));
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      className={cn(
        'transition-all duration-200',
        isAnimating && 'scale-125',
        className
      )}
      title={isFavorite ? 'Sevimlilardan o\'chirish' : 'Sevimlilarga qo\'shish'}
    >
      <Heart 
        className={cn(
          'w-5 h-5 transition-all duration-200',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400',
          showText && 'mr-2'
        )} 
      />
      {showText && (isFavorite ? 'Saqlangan' : 'Saqlash')}
    </Button>
  );
}
