"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getMovieById } from "@/lib/omdb";
import { type MovieDetails } from "@/types";
import { getVibeCheck } from "@/ai/flows/vibe-check-flow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import {
  Plus,
  Check,
  Star,
  Calendar,
  Clock,
  AlertTriangle,
  Film,
  ArrowLeft,
  Wand2,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const imdbID = params.imdbID as string;
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToWatchlist, isOnWatchlist } = useWatchlist();
  const { toast } = useToast();

  const [vibe, setVibe] = useState<string | null>(null);
  const [isVibeCheckPending, startVibeCheckTransition] = useTransition();

  const onList = movie ? isOnWatchlist(movie.imdbID) : false;
  const hasPoster = movie && movie.Poster && movie.Poster !== "N/A";

  const handleAddToWatchlist = () => {
    if (movie) {
      if (isOnWatchlist(movie.imdbID)) {
        toast({
          title: "Already on Watchlist",
          description: `"${movie.Title}" is already on your watchlist.`,
        });
        return;
      }
      const movieSummary: import("@/types").Movie = {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Type: movie.Type,
      };
      addToWatchlist(movieSummary);
      toast({
        title: "Added to Watchlist",
        description: `"${movie.Title}" has been added to your watchlist.`,
      });
    }
  };

  const handleVibeCheck = () => {
    if (!movie) return;
    startVibeCheckTransition(async () => {
      try {
        const result = await getVibeCheck({
          title: movie.Title,
          year: movie.Year,
        });
        setVibe(result.vibe);
      } catch (err) {
        setVibe(
          "Sorry, the AI couldn't quite catch the vibe for this one. Please try again."
        );
      }
    });
  };

  useEffect(() => {
    const fetchMovie = async () => {
      if (!imdbID) return;
      setLoading(true);
      setError(null);
      try {
        const movieDetails = await getMovieById(imdbID);
        if (movieDetails) {
          setMovie(movieDetails);
        } else {
          setError("Movie not found.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
      setLoading(false);
    };
    fetchMovie();
  }, [imdbID]);

  if (loading) {
    return <MovieDetailSkeleton />;
  }

  if (error || !movie) {
    return (
      <div className="text-center py-16">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "We couldn't find details for this movie."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 md:p-8 rounded-lg shadow-lg">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[2/3] w-full rounded-md shadow-xl bg-muted">
            {hasPoster ? (
              <Image
                src={movie.Poster}
                alt={`Poster for ${movie.Title}`}
                width={500}
                height={750}
                className="w-full h-full object-cover rounded-md"
                data-ai-hint={"movie poster"}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              {movie.Title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{movie.Year}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline">{movie.Rated}</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{movie.Runtime}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.Genre.split(", ").map((g) => (
              <Badge key={g}>{g}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-lg text-amber-500">
              <Star className="w-5 h-5 fill-current" />
              <div className="flex items-baseline gap-1">
                <span>{movie.imdbRating}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  / 10
                </span>
                <span className="text-sm font-semibold text-muted-foreground ml-1">
                  IMDb
                </span>
              </div>
            </div>
            <Button onClick={handleAddToWatchlist} disabled={onList}>
              {onList ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {onList ? "On Watchlist" : "Add to Watchlist"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-headline text-xl font-semibold">Plot</h2>
              <p className="text-muted-foreground leading-relaxed">
                {movie.Plot}
              </p>
            </div>

            <Card className="bg-background/50">
              <CardContent className="p-4 space-y-3">
                {!vibe && !isVibeCheckPending && (
                  <div>
                    <h3 className="font-headline font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Want a different take?
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-3">
                      Get an AI-generated "vibe check" for a unique perspective
                      on this film.
                    </p>
                    <Button
                      onClick={handleVibeCheck}
                      disabled={isVibeCheckPending}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      AI Vibe Check
                    </Button>
                  </div>
                )}
                {isVibeCheckPending && (
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                )}
                {vibe && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle className="font-headline">
                      AI Vibe Check
                    </AlertTitle>
                    <AlertDescription>{vibe}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="font-headline text-xl font-semibold">Director</h2>
              <div className="flex flex-wrap gap-x-2">
                {movie.Director.split(", ").map((director, index) => (
                  <a
                    key={index}
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      director
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {director}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-headline text-xl font-semibold">Cast</h2>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {movie.Actors.split(", ").map((actor, index) => (
                  <a
                    key={index}
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      actor
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {actor}
                    {index < movie.Actors.split(", ").length - 1 ? "," : ""}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieDetailSkeleton() {
  return (
    <div className="bg-card p-6 md:p-8 rounded-lg">
      <div className="animate-pulse">
        <Skeleton className="h-10 w-32 mb-6 rounded-md" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="w-full aspect-[2/3] rounded-md" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4 rounded-md" />
              <Skeleton className="h-6 w-1/2 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-28 rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-5/6 rounded-md" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-5 w-1/2 rounded-md" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
