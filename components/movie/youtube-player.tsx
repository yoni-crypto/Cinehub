"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { youtubeApi } from '@/lib/api/youtube';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
}

export function YouTubePlayer({ videoId, title, autoplay = false }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(autoplay);

  const handlePlay = () => {
    setIsPlaying(true);
    setHasStartedPlaying(true);
  };

  if (!isPlaying && !hasStartedPlaying) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <img
          src={youtubeApi.getThumbnailUrl(videoId, 'maxres')}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white h-20 w-20 rounded-full p-0"
            onClick={handlePlay}
          >
            <Play className="w-8 h-8 ml-1" fill="white" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={youtubeApi.getEmbedUrl(videoId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}