"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Info, Star, Calendar } from 'lucide-react';
import { Movie } from '@/lib/types/movie';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroCarouselProps {
  movies: Movie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentMovie = movies[currentIndex];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies.length, isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!movies.length || !currentMovie) return null;

  const releaseYear = currentMovie.release_date 
    ? new Date(currentMovie.release_date).getFullYear()
    : '';
  const rating = Math.round(currentMovie.vote_average * 10) / 10;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={tmdbApi.getBackdropUrl(currentMovie.backdrop_path, 'w1280')}
              alt={currentMovie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Movie Metadata */}
                  <div className="flex items-center space-x-4 mb-4">
                    {rating > 0 && (
                      <Badge variant="secondary" className="bg-black/60 text-white border-0">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {rating}
                      </Badge>
                    )}
                    {releaseYear && (
                      <Badge variant="outline" className="border-white/30 text-white">
                        <Calendar className="w-3 h-3 mr-1" />
                        {releaseYear}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-shadow">
                    {currentMovie.title}
                  </h1>

                  {/* Overview */}
                  <p className="text-lg text-gray-200 mb-8 line-clamp-3 max-w-xl text-shadow">
                    {currentMovie.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                      asChild
                    >
                      <Link href={`/movies/${currentMovie.id}`}>
                        <Play className="w-5 h-5 mr-2" fill="white" />
                        Watch Trailer
                      </Link>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 px-8"
                      asChild
                    >
                      <Link href={`/movies/${currentMovie.id}`}>
                        <Info className="w-5 h-5 mr-2" />
                        More Info
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="lg"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white border-0 h-12 w-12 rounded-full"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="lg"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white border-0 h-12 w-12 rounded-full"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
            key={currentMovie.id}
          />
        </div>
      )}
    </div>
  );
}