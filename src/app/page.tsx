"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { type Movie } from "@/types";
import { searchMovies, getMovieById } from "@/lib/omdb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Star, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { correctQuery } from "@/ai/flows/correct-query-flow";

const trendingMovieIds = [
  "tt0111161", // The Shawshank Redemption (1994)
  "tt0068646", // The Godfather (1972)
  "tt0071562", // The Godfather: Part II (1974)
  "tt0468569", // The Dark Knight (2008)
  "tt0050083", // 12 Angry Men (1957)
  "tt0108052", // Schindler's List (1993)
  "tt0167260", // The Lord of the Rings: The Return of the King (2003)
  "tt0110912", // Pulp Fiction (1994)
  "tt0060196", // The Good, the Bad and the Ugly (1966)
  "tt0137523", // Fight Club (1999)
  "tt0120737", // The Lord of the Rings: The Fellowship of the Ring (2001)
  "tt0109830", // Forrest Gump (1994)
  "tt1375666", // Inception (2010)
  "tt0167261", // The Lord of the Rings: The Two Towers (2002)
  "tt0080684", // Star Wars: Episode V - The Empire Strikes Back (1980)
  "tt0133093", // The Matrix (1999)
  "tt0099685", // Goodfellas (1990)
  "tt0073486", // One Flew Over the Cuckoo's Nest (1975)
  "tt0047478", // Seven Samurai (1954)
  "tt0114369", // Se7en (1995)
  "tt0038650", // It's a Wonderful Life (1946)
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // For suggestions
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoadingTrending(true);
      const moviePromises = trendingMovieIds.map((id) => getMovieById(id));
      const movies = await Promise.all(moviePromises);
      setTrendingMovies(movies.filter((m): m is Movie => m !== null));
      setIsLoadingTrending(false);
    };
    fetchTrending();
  }, []);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery) return;

    startSearchTransition(async () => {
      setShowSuggestions(false);
      setError(null);
      setSearched(true);
      // Correct the query before searching
      const { correctedQuery } = await correctQuery({ query: searchQuery });
      const searchResult = await searchMovies(correctedQuery);
      if (searchResult.error) {
        setError(searchResult.error);
        setResults([]);
      } else {
        setResults(searchResult.movies);
      }
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSuggestionClick = (suggestion: Movie) => {
    setQuery(suggestion.Title);
    setShowSuggestions(false);
    setSearched(true);
    setError(null);
    setResults([suggestion]);
  };

  useEffect(() => {
    if (query.length < 3) {
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = setTimeout(async () => {
      // Also use correction for suggestions for better accuracy
      const { correctedQuery } = await correctQuery({ query });
      const searchResult = await searchMovies(correctedQuery, signal);
      if (!searchResult.error && searchResult.movies) {
        setSuggestions(searchResult.movies.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 500); // 500ms debounce to account for AI call

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-[450px] w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Find Your Next Favorite Film
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Search for movies and build your personal watchlist.
        </p>
      </div>

      <div ref={searchContainerRef} className="max-w-lg mx-auto relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for movies like 'Inception'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length > 1 && setShowSuggestions(true)}
              className="text-base pl-10"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
            <ul className="py-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.imdbID}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                  >
                    {suggestion.Title} ({suggestion.Year})
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {searched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isSearching
              ? renderSkeletons(5)
              : results.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))}
          </div>
        )}
        {!isSearching && searched && results.length === 0 && !error && (
          <div className="text-center py-16 bg-card rounded-lg">
            <h3 className="font-headline text-2xl font-semibold">
              No Results Found
            </h3>
            <p className="text-muted-foreground mt-2">
              Try a different search term.
            </p>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-primary" />
          <h2 className="font-headline text-2xl font-semibold">
            All-Time Best
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {isLoadingTrending
            ? renderSkeletons(6)
            : trendingMovies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
        </div>
      </div>
    </div>
  );
}
