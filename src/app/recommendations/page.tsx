
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/hooks/useWatchlist';
import { recommendMovies, type RecommendMoviesOutput } from '@/ai/flows/recommend-movies-flow';
import { getMovieById } from '@/lib/omdb';
import { type Movie } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Wand2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';

export default function RecommendationsPage() {
  const { watchlist } = useWatchlist();
  const [recommendations, setRecommendations] = useState<RecommendMoviesOutput['recommendations']>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGetRecommendations = () => {
    if (watchlist.length === 0) {
      setError("Your watchlist is empty. Add some movies to get recommendations.");
      return;
    }
    startTransition(async () => {
      setError(null);
      setRecommendations([]);
      setRecommendedMovies([]);
      try {
        const result = await recommendMovies(watchlist);
        setRecommendations(result.recommendations);
        
        const moviePromises = result.recommendations.map(async (rec) => {
          // The getMovieById can return null if the movie is not found, we handle this below
          const movieDetails = await getMovieById(rec.imdbID);
          return movieDetails;
        });

        const movies = await Promise.all(moviePromises);
        // Filter out any null results and movies without posters before setting state
        setRecommendedMovies(movies.filter((m): m is Movie => m !== null && m.Poster !== 'N/A'));

      } catch (e) {
        console.error(e);
        setError('There was an error getting recommendations. Please try again.');
      }
    });
  };
  
  useEffect(() => {
    if (watchlist.length > 0 && recommendations.length === 0) {
        handleGetRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist]);

  if (watchlist.length === 0) {
    return (
       <div className="text-center py-16">
          <Alert className="max-w-md mx-auto">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Watchlist Empty</AlertTitle>
            <AlertDescription>
                Add some movies to your watchlist first to get personalized AI recommendations.
            </AlertDescription>
             <div className="mt-4">
                <Button asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Search
                    </Link>
                </Button>
            </div>
          </Alert>
       </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <Sparkles className="w-12 h-12 text-primary" />
        <h1 className="font-headline text-4xl font-bold">AI Movie Recommendations</h1>
        <p className="text-muted-foreground max-w-2xl">
          Based on your watchlist, here are some movies our AI thinks you'll love. Get a fresh batch of recommendations anytime.
        </p>
         <Button onClick={handleGetRecommendations} disabled={isPending}>
          <Wand2 className="mr-2 h-4 w-4" />
          {isPending ? 'Analyzing Watchlist...' : 'Get New Recommendations'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
                <CardHeader className="p-0">
                    <Skeleton className="h-[330px] w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full mt-2" />
                </CardContent>
            </Card>
          ))}
        </div>
      )}

    {!isPending && recommendedMovies.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6">
            {recommendedMovies.map((movie) => {
                const recData = recommendations.find(r => r.imdbID === movie.imdbID);
                return (
                    <div key={movie.imdbID} className="flex flex-col gap-2">
                         <MovieCard movie={movie} />
                         {recData && (
                            <Card className="bg-background/50 text-sm">
                                <CardContent className="p-3">
                                <p><span className="font-semibold text-primary/80">AI says:</span> {recData.reason}</p>
                                </CardContent>
                            </Card>
                         )}
                    </div>
                )
            })}
        </div>
    )}

      {!isPending && recommendations.length > 0 && recommendedMovies.length === 0 && !error && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <h3 className="font-headline text-2xl font-semibold">Could not find movie details</h3>
            <p className="text-muted-foreground mt-2">The AI found recommendations, but we couldn't find posters or ratings for them.</p>
        </div>
      )}

      {!isPending && recommendations.length === 0 && !error && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <h3 className="font-headline text-2xl font-semibold">Ready for Recommendations?</h3>
            <p className="text-muted-foreground mt-2">Click the button above to get your AI-powered movie suggestions.</p>
        </div>
      )}

    </div>
  );
}
