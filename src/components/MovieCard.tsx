"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Check, Film, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Movie } from "@/types";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  movie: Movie;
  showRemoveButton?: boolean;
}

export function MovieCard({ movie, showRemoveButton = false }: MovieCardProps) {
  const { addToWatchlist, removeFromWatchlist, isOnWatchlist } = useWatchlist();
  const onList = isOnWatchlist(movie.imdbID);
  const hasPoster = movie.Poster && movie.Poster !== "N/A";
  const { toast } = useToast();

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onList) {
      toast({
        title: "Already on Watchlist",
        description: `"${movie.Title}" is already on your watchlist.`,
        variant: "default",
      });
    } else {
      addToWatchlist(movie);
      toast({
        title: "Added to Watchlist",
        description: `"${movie.Title}" has been added to your watchlist.`,
      });
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWatchlist(movie.imdbID);
    toast({
      title: "Removed from Watchlist",
      description: `"${movie.Title}" has been removed from your watchlist.`,
      variant: "destructive",
    });
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col group">
      <Link href={`/movie/${movie.imdbID}`} className="block w-full">
        <CardContent className="p-0">
          <div className="relative">
            <div className="block aspect-[2/3] bg-muted relative">
              {hasPoster ? (
                <Image
                  src={movie.Poster}
                  alt={`Poster for ${movie.Title}`}
                  width={300}
                  height={444}
                  className="w-full h-full object-cover transition-all duration-300"
                  data-ai-hint={"movie poster"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {/* Dark overlay on hover (non-interactive) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center pointer-events-none">
                {movie.imdbRating && movie.imdbRating !== "N/A" && (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl font-extrabold text-amber-400 drop-shadow-lg flex items-center gap-2">
                      <Star className="w-10 h-10 text-amber-400" />
                      {movie.imdbRating}
                    </span>
                    <span className="text-base text-white font-semibold mt-2">
                      IMDb Rating
                    </span>
                  </div>
                )}
              </div>
            </div>
            {showRemoveButton ? (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-9 w-9 z-20"
                onClick={handleRemoveClick}
                aria-label="Remove from watchlist"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant={onList ? "secondary" : "default"}
                size="icon"
                className="absolute top-2 right-2 rounded-full h-9 w-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 border-none text-white z-20"
                onClick={handleAddClick}
                aria-label={onList ? "On watchlist" : "Add to watchlist"}
                disabled={onList}
              >
                {onList ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-semibold text-base truncate hover:text-primary">
                {movie.Title}
              </h3>
              <p className="text-sm text-muted-foreground">{movie.Year}</p>
            </div>
            {/* Remove the always-visible rating below, since it's now on hover */}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
