'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { type Anime, animeTitle, availableEpisodes, FORMAT_LABEL } from '@/lib/api/anilist';

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

// Visual twin of TVShowCard so anime sits naturally next to movies/TV.
export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = animeTitle(anime);
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const isMovie = anime.format === 'MOVIE';
  const eps = availableEpisodes(anime);

  return (
    <div className="group relative rounded-lg overflow-hidden">
      <Link href={`/anime/${anime.id}`}>
        <div
          className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-900/70"
          style={anime.coverImage.color ? { backgroundColor: anime.coverImage.color } : undefined}
        >
          <Image
            src={anime.coverImage.extraLarge || anime.coverImage.large || '/placeholder.png'}
            alt={`Watch ${title} online free - sub and dub`}
            fill
            className={`object-cover transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-[1.03]`}
            onLoad={() => setImageLoaded(true)}
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          <div className="absolute inset-0 z-[1] bg-black/0 group-hover:bg-black/40 transition-colors duration-150" />
          <div className="absolute inset-0 z-[2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 shadow-md flex items-center justify-center">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
            </div>
          </div>

          {score && (
            <div className="absolute bottom-1.5 left-1.5 z-[3] bg-black/85 text-[11px] text-white px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="text-[10px] opacity-80">★</span>
              <span className="font-semibold">{score}</span>
            </div>
          )}

          <div className="absolute top-2 right-2 z-[3] flex items-center gap-1.5">
            {anime.status === 'RELEASING' && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                Airing
              </span>
            )}
            <span className="bg-white text-gray-900 border border-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              HD
            </span>
          </div>
        </div>
      </Link>

      <div className="pt-2">
        <h3 className="font-medium text-foreground text-xs sm:text-sm line-clamp-1 mb-1">{title}</h3>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate">
            {isMovie ? anime.seasonYear ?? '' : `EP ${eps}${anime.episodes && anime.status === 'RELEASING' ? ` / ${anime.episodes}` : ''}`}
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-white text-gray-900 border border-gray-900 dark:bg-gray-900/80 dark:text-white dark:border-gray-700 text-[10px] uppercase tracking-wide flex-shrink-0">
            {FORMAT_LABEL[anime.format ?? ''] ?? 'Anime'}
          </span>
        </div>
      </div>
    </div>
  );
}
