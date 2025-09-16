"use client";

import { type Movie } from '@/types';
import { createContext } from 'react';

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (imdbID: string) => void;
  isOnWatchlist: (imdbID: string) => boolean;
}

export const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);
