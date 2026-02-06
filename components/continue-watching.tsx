'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, X } from 'lucide-react';
import { continueWatching } from '@/lib/continue-watching';
import { tmdbApi } from '@/lib/api/tmdb';

interface WatchProgress {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  poster: string;
  lastWatched: number;
  progress?: number;
  season?: number;
  episode?: number;
  episodeName?: string;
}

export function ContinueWatching() {
  const [items, setItems] = useState<WatchProgress[]>([]);

  useEffect(() => {
    setItems(continueWatching.getAll());
  }, []);

  const handleRemove = (id: string, type: 'movie' | 'tv') => {
    continueWatching.remove(id, type);
    setItems(continueWatching.getAll());
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Continue Watching</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {items.slice(0, 10).map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex-shrink-0 w-48 group relative">
            <Link href={
              item.type === 'movie' 
                ? `/movies/${item.id}?autoplay=true` 
                : `/tv-shows/${item.id}?autoplay=true&season=${item.season}&episode=${item.episode}`
            }>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                <Image
                  src={tmdbApi.getImageUrl(item.poster, 'w500')}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Continue watching badge for TV shows */}
                {item.type === 'tv' && item.season && item.episode && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    S{item.season}E{item.episode}
                  </div>
                )}
                
                {/* Progress bar */}
                {item.progress && item.progress > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-red-600" 
                      style={{ width: `${Math.min(item.progress, 95)}%` }}
                    />
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                </div>
              </div>
            </Link>
            
            {/* Remove button */}
            <button
              onClick={() => handleRemove(item.id, item.type)}
              className="absolute top-1 right-1 bg-black/70 hover:bg-black/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            
            {/* Title and episode info */}
            <div className="text-foreground text-sm">
              <p className="font-medium truncate">{item.title}</p>
              {item.type === 'tv' && item.season && item.episode && (
                <p className="text-muted-foreground text-xs truncate">
                  S{item.season}E{item.episode}
                  {item.episodeName && ` • ${item.episodeName}`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}