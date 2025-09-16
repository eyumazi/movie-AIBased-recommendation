"use client";

import { WatchlistContext } from "@/contexts/WatchlistContext";
import { type Movie } from "@/types";
import React, { useState, useEffect, useCallback } from "react";

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem("movieboard-watchlist");
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (error) {
      console.error("Failed to parse watchlist from localStorage", error);
      setWatchlist([]);
    }
  }, []);

  const updateLocalStorage = (newWatchlist: Movie[]) => {
    try {
      localStorage.setItem(
        "movieboard-watchlist",
        JSON.stringify(newWatchlist)
      );
    } catch (error) {
      console.error("Failed to save watchlist to localStorage", error);
    }
  };

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.find((m) => m.imdbID === movie.imdbID)) {
        return prev;
      }
      const newWatchlist = [...prev, movie];
      updateLocalStorage(newWatchlist);
      return newWatchlist;
    });
  }, []);

  const removeFromWatchlist = useCallback((imdbID: string) => {
    setWatchlist((prev) => {
      const movieToRemove = prev.find((m) => m.imdbID === imdbID);
      const newWatchlist = prev.filter((m) => m.imdbID !== imdbID);
      updateLocalStorage(newWatchlist);
      return newWatchlist;
    });
  }, []);

  const isOnWatchlist = useCallback(
    (imdbID: string) => {
      return watchlist.some((m) => m.imdbID === imdbID);
    },
    [watchlist]
  );

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isOnWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}
