"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
}

const categories = [
  { id: 'popular', label: 'Popular', href: '/categories?category=popular' },
  { id: 'top-rated', label: 'Top Rated', href: '/categories?category=top-rated' },
  { id: 'upcoming', label: 'Upcoming', href: '/categories?category=upcoming' },
  { id: 'now-playing', label: 'Now Playing', href: '/categories?category=now-playing' },
];

export function CategoryTabs({ activeCategory }: CategoryTabsProps) {
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
