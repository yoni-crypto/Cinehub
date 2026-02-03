'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { toast } from 'sonner';
import { StreamingModal } from './streaming-modal';

interface StreamingButtonProps {
  movieId: number;
  movieTitle: string;
  posterPath?: string;
  backdropPath?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
  iconOnly?: boolean;
}

export default function StreamingButton({ 
  movieId, 
  movieTitle, 
  posterPath,
  backdropPath,
  className = '',
  size = 'default',
  children,
  iconOnly = false
}: StreamingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWatchMovie = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsModalOpen(true);
      toast.success(`Opening ${movieTitle}...`);
    } catch (error) {
      console.error('Error opening streaming:', error);
      toast.error('Failed to open streaming. Please try again.');
    }
  }, [movieId, movieTitle]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <button
        onClick={handleWatchMovie}
        className={className}
        type="button"
      >
        {children || (
          iconOnly ? (
            <Play className="w-4 h-4" />
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Watch Full Movie</span>
              <span className="sm:hidden">Watch Movie</span>
            </>
          )
        )}
      </button>

      <StreamingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movieId={movieId}
        title={movieTitle}
        posterPath={posterPath}
        backdropPath={backdropPath}
      />
    </>
  );
}
