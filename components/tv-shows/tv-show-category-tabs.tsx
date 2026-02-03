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
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-1 inline-flex">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        
        return (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              'px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            )}
          >
            {category.label}
          </Link>
        );
      })}
    </div>
  );
}
