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
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-1 flex overflow-x-auto scrollbar-hide">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        
        return (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              'px-4 sm:px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
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
