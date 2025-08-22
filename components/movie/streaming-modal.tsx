"use client";

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StreamingPlayer } from './streaming-player';

interface StreamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  isTVShow?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
}

export function StreamingModal({
  isOpen,
  onClose,
  movieId,
  title,
  posterPath,
  backdropPath,
  isTVShow = false,
  seasonNumber,
  episodeNumber
}: StreamingModalProps) {
  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll and navigation
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      
      // Prevent back button navigation on mobile
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        // Push a new state to prevent going back
        window.history.pushState(null, '', window.location.href);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleKeyDown);
      
      // Push a new state to prevent back navigation
      window.history.pushState(null, '', window.location.href);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      // Cleanup
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh]">
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 p-0 bg-black/60 hover:bg-black/80 border-0 z-20"
          onClick={handleClose}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <div className="bg-black rounded-lg overflow-hidden">
          <StreamingPlayer
            movieId={movieId}
            title={title}
            posterPath={posterPath}
            backdropPath={backdropPath}
            autoplay={true}
            onClose={handleClose}
            isTVShow={isTVShow}
            seasonNumber={seasonNumber}
            episodeNumber={episodeNumber}
          />
        </div>
      </div>
    </div>
  );
}
