"use client";

import { Movie } from '@/lib/types/movie';
import { MovieCard } from './movie-card';
import { motion } from 'framer-motion';

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  showYear?: boolean;
  showRating?: boolean;
}

export function MovieGrid({ 
  movies, 
  title, 
  showYear = true, 
  showRating = true 
}: MovieGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-shadow">
          {title}
        </h2>
      )}
      
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {movies.map((movie, index) => (
          <motion.div key={movie.id} variants={itemVariants}>
            <MovieCard
              movie={movie}
              showYear={showYear}
              showRating={showRating}
              priority={index < 6} // Prioritize first 6 images
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}