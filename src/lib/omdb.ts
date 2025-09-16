import { type Movie, type MovieDetails } from "@/types";

const API_KEY = "199bde40";
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;


interface SearchResponse {
    Search?: Movie[];
    totalResults?: string;
    Response: "True" | "False";
    Error?: string;
}

export const searchMovies = async (query: string, signal?: AbortSignal): Promise<{movies: Movie[], error: string | null}> => {
  if (!query) {
    return { movies: [], error: null };
  }

  try {
    const response = await fetch(`${API_URL}&s=${encodeURIComponent(query)}`, { signal });
    
    if (signal?.aborted) {
      return { movies: [], error: "Search aborted." };
    }

    const data: SearchResponse = await response.json();
    
    if (data.Response === "True" && data.Search) {
      return { movies: data.Search, error: null };
    } else {
      return { movies: [], error: data.Error || "No results found." };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
      return { movies: [], error: "Search aborted." };
    }
    console.error("Failed to search movies:", error);
    return { movies: [], error: "Failed to connect to the movie database." };
  }
};

export const getMovieById = async (id: string): Promise<MovieDetails | null> => {
  if (!id) return null;
  try {
      const response = await fetch(`${API_URL}&i=${id}&plot=full`);
      const data: MovieDetails & { Response: "True" | "False", Error?: string } = await response.json();

      if (data.Response === "True") {
          return data;
      } else {
          return null;
      }
  } catch (error) {
      console.error("Failed to fetch movie by ID:", error);
      throw new Error("Failed to connect to the movie database.");
  }
};
