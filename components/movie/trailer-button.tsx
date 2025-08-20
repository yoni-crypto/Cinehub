"use client";

import { Button } from '@/components/ui/button';

interface TrailerButtonProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export function TrailerButton({ className, size = 'lg' }: TrailerButtonProps) {
  const handleClick = () => {
    const trailerSection = document.getElementById('trailer');
    if (trailerSection) {
      trailerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      size={size}
      className={`bg-primary hover:bg-primary/90 text-white px-4 sm:px-8 ${className || ''}`}
      onClick={handleClick}
    >
      Watch Trailer
    </Button>
  );
}
