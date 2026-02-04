'use client';

import { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface StreamingPlayerProps {
  url: string;
  title: string;
  onClose?: () => void;
}

export function StreamingPlayer({ url, title, onClose }: StreamingPlayerProps) {
  const [playerMethod, setPlayerMethod] = useState<'iframe' | 'popup' | 'redirect'>('iframe');
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Detect mobile and force popup/redirect
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 768;
    
    if (isMobile || isSmallScreen) {
      setPlayerMethod('popup');
      setShowFallback(true);
    }
  }, []);

  const openInPopup = () => {
    const popup = window.open(
      url,
      'streamPlayer',
      'width=1280,height=720,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (!popup) {
      // Popup blocked, try redirect
      window.location.href = url;
    }
  };

  const openInNewTab = () => {
    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newTab) {
      window.location.href = url;
    }
  };

  if (showFallback) {
    return (
      <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center gap-4 text-white">
        <Play className="w-16 h-16 text-red-500" fill="currentColor" />
        <h3 className="text-lg font-semibold">Choose Playback Method</h3>
        <p className="text-sm text-gray-400 text-center max-w-md">
          For the best experience on mobile, choose how you'd like to watch
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={openInPopup}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Popup Window
          </button>
          
          <button
            onClick={openInNewTab}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </button>
          
          <button
            onClick={() => setShowFallback(false)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Embedded Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      <iframe
        src={url}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        frameBorder="0"
        title={title}
        referrerPolicy="no-referrer"
        loading="eager"
        onError={() => setShowFallback(true)}
      />
      
      {/* Fallback button overlay */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setShowFallback(true)}
          className="bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded text-xs transition-colors"
        >
          Options
        </button>
      </div>
    </div>
  );
}