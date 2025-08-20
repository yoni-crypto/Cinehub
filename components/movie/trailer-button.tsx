"use client";

import { Button } from '@/components/ui/button';

interface TrailerButtonProps {
  className?: string;
}

export function TrailerButton({ className }: TrailerButtonProps) {
  const handleClick = () => {
    const trailerSection = document.getElementById('trailer');
    if (trailerSection) {
      trailerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      size="lg"
      className={`bg-primary hover:bg-primary/90 text-white px-8 ${className || ''}`}
      onClick={handleClick}
    >
      Watch Trailer
    </Button>
  );
}
