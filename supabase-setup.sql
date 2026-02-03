-- Cinehub Database Setup
-- Run this in your Supabase SQL Editor

-- Create favorites table
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Create watchlist table  
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for watchlist
CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON watchlist
  FOR DELETE USING (auth.uid() = user_id);