import Image from 'next/image';
import { Cast } from '@/lib/types/movie';
import { tmdbApi } from '@/lib/api/tmdb';
import { User } from 'lucide-react';

interface CastGridProps {
  cast: Cast[];
}

export function CastGrid({ cast }: CastGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cast.map((person) => (
        <div key={person.id} className="text-center group">
          <div className="relative aspect-[3/4] mb-3 rounded-lg overflow-hidden bg-secondary">
            {person.profile_path ? (
              <Image
                src={tmdbApi.getImageUrl(person.profile_path, 'w185')}
                alt={person.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-sm text-foreground">{person.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{person.character}</p>
        </div>
      ))}
    </div>
  );
}