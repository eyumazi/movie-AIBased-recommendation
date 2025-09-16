"use client";

import { WatchlistContext } from '@/contexts/WatchlistContext';
import { useContext } from 'react';

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
