"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TVShowCategoryTabsProps {
  activeCategory: string;
}

const categories = [
  { id: 'popular', label: 'Popular', href: '/tv-shows?category=popular' },
  { id: 'top-rated', label: 'Top Rated', href: '/tv-shows?category=top-rated' },
  { id: 'on-the-air', label: 'On The Air', href: '/tv-shows?category=on-the-air' },
  { id: 'airing-today', label: 'Airing Today', href: '/tv-shows?category=airing-today' },
];

export function TVShowCategoryTabs({ activeCategory }: TVShowCategoryTabsProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        
        return (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {category.label}
          </Link>
        );
      })}
    </div>
  );
}
