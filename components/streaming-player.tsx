'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Maximize, X } from 'lucide-react';

interface StreamingPlayerProps {
  url: string;
  title: string;
  onClose?: () => void;
  onError?: () => void;
}

export function StreamingPlayer({ url, title, onClose, onError }: StreamingPlayerProps) {
  const [playerMethod, setPlayerMethod] = useState<'iframe' | 'popup' | 'redirect'>('iframe');
  const [showFallback, setShowFallback] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [overlayActive, setOverlayActive] = useState(true);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPlayerMethod('iframe');
    setShowFallback(false);
  }, [url]);

  // Reset overlay on URL change, auto-drop after 4s
  useEffect(() => {
    setOverlayActive(true);
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = setTimeout(() => setOverlayActive(false), 1500);
    return () => { if (overlayTimer.current) clearTimeout(overlayTimer.current); };
  }, [url]);

  // Steal focus back any time the iframe opens a pop-under
  useEffect(() => {
    const refocus = () => setTimeout(() => window.focus(), 50);
    window.addEventListener('blur', refocus);
    return () => window.removeEventListener('blur', refocus);
  }, []);

  const handleOverlayClick = () => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    setTimeout(() => setOverlayActive(false), 300);
  };

  const openInPopup = () => {
    const popup = window.open(
      url,
      'streamPlayer',
      'width=1280,height=720,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (!popup) {
      window.location.href = url;
    }
  };

  const openInNewTab = () => {
    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newTab) {
      window.location.href = url;
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
    setShowFallback(true);
    onError?.();
  };

  const requestFullscreen = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    }
  };

  if (showFallback) {
    return (
      <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center gap-4 text-white">
        <button
          onClick={() => setShowFallback(false)}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded transition-colors"
          title="Close options"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        
        <Play className="w-16 h-16 text-red-500" fill="currentColor" />
        <h3 className="text-lg font-semibold">Player Options</h3>
        <p className="text-sm text-gray-400 text-center max-w-md">
          {iframeError ? 'Embedded player blocked. Choose an alternative:' : 'Choose how you\'d like to watch:'}
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
          
          {!iframeError && (
            <button
              onClick={() => setShowFallback(false)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Embedded Player
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      <iframe
        src={url}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        frameBorder="0"
        title={title}
        referrerPolicy="no-referrer"
        loading="eager"
        onError={handleIframeError}
        onLoad={() => setIframeError(false)}
      />
      {overlayActive && (
        <div
          className="absolute inset-0 z-10 bg-black/70 flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={handleOverlayClick}
        >
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white/60 text-xs">Loading player…</span>
        </div>
      )}
      
      {/* Control overlay */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={requestFullscreen}
          className="bg-black/70 hover:bg-black/90 text-white p-1.5 rounded text-xs transition-colors"
          title="Fullscreen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
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