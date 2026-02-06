'use client';

interface LoadingScreenProps {
  /** Optional message below the bars (e.g. "Loading…", "Signing you in...") */
  message?: string;
  /** Use full viewport height (default true). Set false for inline loading. */
  fullScreen?: boolean;
  /** Compact: logo + bars only, smaller size (e.g. inside player). No min-height. */
  compact?: boolean;
}

export function LoadingScreen({ message, fullScreen = true, compact = false }: LoadingScreenProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-background h-full min-h-[200px]">
        <div className="flex space-x-1.5">
          <div
            className="w-2 h-8 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-8 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
            style={{ animationDelay: '200ms' }}
          />
          <div
            className="w-2 h-8 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
            style={{ animationDelay: '400ms' }}
          />
        </div>
        {message && <p className="text-muted-foreground text-xs">{message}</p>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-background ${
        fullScreen ? 'min-h-screen' : 'min-h-[40vh] py-12'
      }`}
    >
      <div className="flex space-x-2">
        <div
          className="w-3 h-12 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-3 h-12 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
          style={{ animationDelay: '200ms' }}
        />
        <div
          className="w-3 h-12 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
          style={{ animationDelay: '400ms' }}
        />
      </div>
      {message && (
        <p className="mt-6 text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}
