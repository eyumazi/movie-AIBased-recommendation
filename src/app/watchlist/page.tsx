"use client";

import { useWatchlist } from '@/hooks/useWatchlist';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Film, Sparkles } from 'lucide-react';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-4xl font-bold">My Watchlist</h1>
        {watchlist.length > 0 && (
          <Button asChild>
            <Link href="/recommendations">
              <Sparkles className="mr-2" />
              Get AI Recommendations
            </Link>
          </Button>
        )}
      </div>

      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchlist.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} showRemoveButton={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
          <Film className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="font-headline text-2xl font-semibold">Your Watchlist is Empty</h3>
          <p className="text-muted-foreground mt-2">Add movies to your watchlist to see them here.</p>
          <Button asChild className="mt-4">
            <Link href="/">Start Searching</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
