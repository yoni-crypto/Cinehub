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

  useEffect(() => {
    if (!isAutoPlaying || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 10000); // 10 seconds as per README

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
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] xl:h-[85vh] min-h-[500px] sm:min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <Image
              src={tmdbApi.getBackdropUrl(currentMovie.backdrop_path, 'w1280')}
              alt={currentMovie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
          </div>

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
                    {rating > 0 && (
                      <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs sm:text-sm">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {rating}
                      </Badge>
                    )}
                    {releaseYear && (
                      <Badge variant="outline" className="border-white/30 text-white text-xs sm:text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {releaseYear}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {currentMovie.title}
                  </h1>

                  <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-8 sm:mb-10 line-clamp-3 max-w-2xl leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {currentMovie.overview}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      asChild
                    >
                      <Link href={`/movies/${currentMovie.id}`}>
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3" fill="white" />
                        Watch Now
                      </Link>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      asChild
                    >
                      <Link href={`/movies/${currentMovie.id}`}>
                        <Info className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
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

      {movies.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-red-600 scale-125 shadow-lg' 
                    : 'bg-white/40 hover:bg-white/70 hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}